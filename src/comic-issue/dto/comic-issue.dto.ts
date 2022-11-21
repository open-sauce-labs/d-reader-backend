import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { getReadUrl } from 'src/aws/s3client';
import { ComicPageDto } from 'src/comic-page/entities/comic-page.dto';
import { ComicDto } from 'src/comic/dto/comic.dto';
import { CreatorDto } from 'src/creator/dto/creator.dto';
import { IsKebabCase } from 'src/decorators/IsKebabCase';
import { Presignable } from 'src/types/presignable';
import { getRandomFloatOrInt, getRandomInt } from 'src/utils/helpers';
import { ComicIssueStatsDto } from './comic-issue-stats.dto';

@Exclude()
export class ComicIssueDto extends Presignable<ComicIssueDto> {
  @Expose()
  @IsPositive()
  id: number;

  @Expose()
  @IsPositive()
  number: number;

  @Expose()
  @IsNotEmpty()
  title: string;

  @Expose()
  @IsNotEmpty()
  @IsKebabCase()
  slug: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsString()
  flavorText: string;

  @Expose()
  @IsString()
  cover: string;

  @Expose()
  @IsString()
  soundtrack: string;

  @Expose()
  @IsDateString()
  releaseDate: string;

  @Expose()
  @Transform(({ obj }) => !!obj.publishedAt)
  isPublished: boolean;

  @Expose()
  @Transform(({ obj }) => !!obj.popularizedAt)
  isPopular: boolean;

  @Expose()
  @Transform(({ obj }) => !!obj.deletedAt)
  isDeleted: boolean;

  @Expose()
  @Transform(({ obj }) => !!obj.verifiedAt)
  isVerified: boolean;

  @Expose()
  @IsPositive()
  comicId: number;

  // TODO: CreatorPreviewDto
  @Expose()
  @Transform(({ obj }) => {
    if (obj.comic?.creator) {
      return {
        name: obj.comic.creator?.name,
        slug: obj.comic.creator?.slug,
        isVerified: !!obj.comic.creator?.verifiedAt,
        avatar: obj.comic.creator?.avatar,
      };
    } else return undefined;
  })
  creator: Pick<CreatorDto, 'name' | 'slug' | 'isVerified' | 'avatar'>;

  @Expose()
  @Transform(({ obj }) => {
    if (obj.comic) {
      return {
        name: obj.comic?.name,
        slug: obj.comic?.slug,
      };
    } else return undefined;
  })
  comic: Pick<ComicDto, 'name' | 'slug'>;

  // TODO: replace with real data
  @Expose()
  @IsOptional()
  @Type(() => ComicIssueStatsDto)
  @Transform(() => ({
    floorPrice: getRandomFloatOrInt(1, 20),
    totalSupply: getRandomInt(1, 10) * 100,
    totalVolume: getRandomFloatOrInt(1, 1000),
    totalIssuesCount: getRandomInt(6, 14),
  }))
  stats?: ComicIssueStatsDto[];

  @Expose()
  @IsArray()
  @IsOptional()
  @Type(() => ComicPageDto)
  pages?: ComicPageDto[];

  @Expose()
  @IsOptional()
  @ArrayUnique()
  @Type(() => String)
  @Transform(({ obj }) => obj.nfts?.map((nft) => nft.mint))
  hashlist?: string[];

  protected async presign(): Promise<ComicIssueDto> {
    return await super.presign(this, ['cover', 'soundtrack']);
  }

  static async presignUrls(input: ComicIssueDto): Promise<ComicIssueDto>;
  static async presignUrls(input: ComicIssueDto[]): Promise<ComicIssueDto[]>;
  static async presignUrls(
    input: ComicIssueDto | ComicIssueDto[],
  ): Promise<ComicIssueDto | ComicIssueDto[]> {
    if (Array.isArray(input)) {
      return await Promise.all(
        input.map(async (obj) => {
          if (obj.pages) obj.pages = await ComicPageDto.presignUrls(obj.pages);
          if (obj.creator?.avatar) {
            obj.creator.avatar = await getReadUrl(obj.creator.avatar);
          }
          return obj.presign();
        }),
      );
    } else {
      if (input.pages) {
        input.pages = await ComicPageDto.presignUrls(input.pages);
      }
      if (input.creator?.avatar) {
        input.creator.avatar = await getReadUrl(input.creator.avatar);
      }
      return await input.presign();
    }
  }
}
