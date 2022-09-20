import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateComicDto,
  CreateComicFilesDto,
} from 'src/comic/dto/create-comic.dto';
import { UpdateComicDto } from 'src/comic/dto/update-comic.dto';
import {
  deleteS3Object,
  deleteS3Objects,
  listS3FolderKeys,
  putS3Object,
} from '../aws/s3client';
import { isEmpty } from 'lodash';
import * as path from 'path';

@Injectable()
export class ComicService {
  constructor(private prisma: PrismaService) {}

  async create(
    creatorId: number,
    createComicDto: CreateComicDto,
    createComicFilesDto: CreateComicFilesDto,
  ) {
    const { slug, ...rest } = createComicDto;
    const { thumbnail, pfp, logo } = createComicFilesDto;

    // Upload files if any
    let thumbnailKey: string, pfpKey: string, logoKey: string;
    try {
      if (thumbnail) thumbnailKey = await this.uploadFile(slug, thumbnail);
      if (pfp) pfpKey = await this.uploadFile(slug, pfp);
      if (logo) logoKey = await this.uploadFile(slug, logo);
    } catch {
      throw new BadRequestException('Malformed file upload');
    }

    try {
      const comic = await this.prisma.comic.create({
        include: { issues: true },
        data: {
          ...rest,
          slug,
          creatorId,
          thumbnail: thumbnailKey,
          pfp: pfpKey,
          logo: logoKey,
        },
      });

      return comic;
    } catch {
      // Revert file upload
      if (thumbnailKey) await deleteS3Object({ Key: thumbnailKey });
      if (pfpKey) await deleteS3Object({ Key: pfpKey });
      if (logoKey) await deleteS3Object({ Key: logoKey });
      throw new BadRequestException('Faulty comic data');
    }
  }

  async findAll() {
    const comics = await this.prisma.comic.findMany({
      where: {
        deletedAt: null,
        publishedAt: { not: null },
        verifiedAt: { not: null },
      },
    });
    return comics;
  }

  async findOne(slug: string) {
    const comic = await this.prisma.comic.findUnique({
      where: { slug },
    });

    if (!comic) {
      throw new NotFoundException(`Comic ${slug} does not exist`);
    }

    return comic;
  }

  async update(slug: string, updateComicDto: UpdateComicDto) {
    const { ...rest } = updateComicDto;

    // TODO: if name has changed, update folder names in the S3 bucket
    // if (updateComicDto.name && name !== updateComicDto.name)
    // copy folder and delete the old one, update keys in the database
    // https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/examples-s3-objects.html#copy-object
    // https://www.anycodings.com/1questions/5143423/nodejs-renaming-s3-object-via-aws-sdk-module

    try {
      const updatedComic = await this.prisma.comic.update({
        where: { slug },
        data: rest,
      });

      return updatedComic;
    } catch {
      throw new NotFoundException(`Comic ${slug} does not exist`);
    }
  }

  async updateFile(slug: string, file: Express.Multer.File) {
    const fileKey = await this.uploadFile(slug, file);
    try {
      const updatedComic = await this.prisma.comic.update({
        where: { slug },
        data: { [file.fieldname]: fileKey },
      });

      return updatedComic;
    } catch {
      // Revert file upload
      await deleteS3Object({ Key: fileKey });
      throw new NotFoundException(`Comic ${slug} does not exist`);
    }
  }

  async publish(slug: string) {
    try {
      await this.prisma.comic.update({
        where: { slug },
        data: { publishedAt: new Date() },
      });
    } catch {
      throw new NotFoundException(`Comic ${slug} does not exist`);
    }
  }

  async unpublish(slug: string) {
    try {
      await this.prisma.comic.update({
        where: { slug },
        data: { publishedAt: null },
      });
    } catch {
      throw new NotFoundException(`Comic ${slug} does not exist`);
    }
  }

  async pseudoDelete(slug: string) {
    try {
      await this.prisma.comic.update({
        where: { slug },
        data: { deletedAt: new Date() },
      });
    } catch {
      throw new NotFoundException(`Comic ${slug} does not exist`);
    }
  }

  async pseudoRecover(slug: string) {
    try {
      await this.prisma.comic.update({
        where: { slug },
        data: { deletedAt: null },
      });
    } catch {
      throw new NotFoundException(`Comic ${slug} does not exist`);
    }
  }

  async remove(slug: string) {
    // Remove s3 assets
    const keys = await listS3FolderKeys({ Prefix: `comics/${slug}` });

    if (!isEmpty(keys)) {
      await deleteS3Objects({
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      });
    }

    try {
      await this.prisma.comic.delete({ where: { slug } });
    } catch {
      throw new NotFoundException(`Comic ${slug} does not exist`);
    }
    return;
  }

  async uploadFile(slug: string, file: Express.Multer.File) {
    if (file) {
      const fileKey = `comics/${slug}/${file.fieldname}${path.extname(
        file.originalname,
      )}`;

      await putS3Object({
        ContentType: file.mimetype,
        Key: fileKey,
        Body: file.buffer,
      });

      return fileKey;
    } else {
      throw new BadRequestException(`No valid ${file.fieldname} file provided`);
    }
  }
}
