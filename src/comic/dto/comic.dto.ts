import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ComicIssueDto } from 'src/comic-issue/dto/comic-issue.dto';
import { IsKebabCase } from 'src/decorators/IsKebabCase';
import { CreatorDto } from 'src/creator/dto/creator.dto';
import { IsEmptyOrUrl } from 'src/decorators/IsEmptyOrUrl';
import { Presignable } from 'src/types/presignable';
import { ComicStatsDto } from './comic-stats.dto';
import { WalletComicDto } from './wallet-comic.dto';
import { ApiProperty } from '@nestjs/swagger';
import { getReadUrl } from 'src/aws/s3client';
import { GenreDto } from 'src/genre/dto/genre.dto';

@Exclude()
export class ComicDto extends Presignable<ComicDto> {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsKebabCase()
  slug: string;

  @Expose()
  @IsBoolean()
  isCompleted: boolean;

  @Expose()
  @IsBoolean()
  isMatureAudience: boolean;

  @Expose()
  @Transform(({ obj }) => !!obj.deletedAt)
  isDeleted: boolean;

  @Expose()
  @Transform(({ obj }) => !!obj.verifiedAt)
  isVerified: boolean;

  @Expose()
  @Transform(({ obj }) => !!obj.publishedAt)
  isPublished: boolean;

  @Expose()
  @Transform(({ obj }) => !!obj.popularizedAt)
  isPopular: boolean;

  @Expose()
  @IsString()
  cover: string;

  @Expose()
  @IsString()
  pfp: string;

  @Expose()
  @IsString()
  logo: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsString()
  flavorText: string;

  @Expose()
  @IsEmptyOrUrl()
  website: string;

  @Expose()
  @IsEmptyOrUrl()
  twitter: string;

  @Expose()
  @IsEmptyOrUrl()
  discord: string;

  @Expose()
  @IsEmptyOrUrl()
  telegram: string;

  @Expose()
  @IsEmptyOrUrl()
  instagram: string;

  @Expose()
  @IsEmptyOrUrl()
  tikTok: string;

  @Expose()
  @IsEmptyOrUrl()
  youTube: string;

  // TODO: GenrePreviewDto
  @Expose()
  @Transform(({ obj }) => {
    if (obj.genres) {
      return obj.genres.map((genre) => ({
        name: genre?.name,
        // slug: genre?.slug,
        color: genre?.color,
      }));
    } else return undefined;
  })
  genres: Array<Pick<GenreDto, 'name' | 'color'>>;

  @Expose()
  @IsOptional()
  @Type(() => ComicStatsDto)
  stats?: ComicStatsDto;

  @Expose()
  @IsOptional()
  @Type(() => WalletComicDto)
  myStats?: WalletComicDto;

  @Expose()
  @IsArray()
  @IsOptional()
  @Type(() => ComicIssueDto)
  issues?: ComicIssueDto[];

  @Expose()
  @Transform(({ obj }) => {
    if (obj.creator) {
      return {
        name: obj.creator?.name,
        slug: obj.creator?.slug,
        isVerified: !!obj.creator?.verifiedAt,
        avatar: obj.creator?.avatar,
      };
    } else return undefined;
  })
  creator: Pick<CreatorDto, 'name' | 'slug' | 'isVerified' | 'avatar'>;

  @Expose()
  @IsOptional()
  @IsNumber()
  favouritesCount?: number | null;

  protected async presign(): Promise<ComicDto> {
    return await super.presign(this, ['cover', 'logo', 'pfp']);
  }

  static async presignUrls(input: ComicDto): Promise<ComicDto>;
  static async presignUrls(input: ComicDto[]): Promise<ComicDto[]>;
  static async presignUrls(
    input: ComicDto | ComicDto[],
  ): Promise<ComicDto | ComicDto[]> {
    if (Array.isArray(input)) {
      return await Promise.all(
        input.map(async (obj) => {
          if (obj.issues) {
            obj.issues = await ComicIssueDto.presignUrls(obj.issues);
          }
          if (obj.creator?.avatar) {
            obj.creator.avatar = await getReadUrl(obj.creator.avatar);
          }
          return obj.presign();
        }),
      );
    } else {
      if (input.issues) {
        input.issues = await ComicIssueDto.presignUrls(input.issues);
      }
      if (input.creator?.avatar) {
        input.creator.avatar = await getReadUrl(input.creator.avatar);
      }
      return await input.presign();
    }
  }
}

@Exclude()
export class ComicFilterQueryParams {
  @Expose()
  @IsOptional()
  @IsKebabCase()
  creatorSlug?: string;

  @Expose()
  @IsOptional()
  @IsString()
  nameSubstring?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @ApiProperty({ type: String })
  @Type(() => String)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    } else return value;
  })
  genreSlugs?: string[];
}
