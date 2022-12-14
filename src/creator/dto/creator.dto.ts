import { plainToInstance, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { IsKebabCase } from 'src/decorators/IsKebabCase';
import { getRandomFloatOrInt, getRandomInt } from 'src/utils/helpers';
import { CreatorStatsDto } from './creator-stats.dto';
import { CreatorStats } from 'src/comic/types/creator-stats';
import { Creator } from '@prisma/client';
import { getReadUrl } from 'src/aws/s3client';
import { IsOptionalUrl } from 'src/decorators/IsOptionalUrl';

export class CreatorDto {
  @IsPositive()
  id: number;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MaxLength(54)
  name: string;

  @IsNotEmpty()
  @IsKebabCase()
  slug: string;

  @IsBoolean()
  isDeleted: boolean;

  @IsBoolean()
  isVerified: boolean;

  @IsUrl()
  avatar: string;

  @IsUrl()
  banner: string;

  @IsUrl()
  logo: string;

  @IsString()
  @MaxLength(256)
  description: string;

  @IsString()
  @MaxLength(128)
  flavorText: string;

  @IsOptionalUrl()
  website: string;

  @IsOptional()
  @Type(() => CreatorStatsDto)
  stats?: CreatorStatsDto;
}

type CreatorInput = Creator & { stats?: CreatorStats };

export async function toCreatorDto(creator: CreatorInput) {
  const plainCreatorDto: CreatorDto = {
    id: creator.id,
    email: creator.email,
    name: creator.name,
    slug: creator.slug,
    isDeleted: !!creator.deletedAt,
    isVerified: !!creator.verifiedAt,
    avatar: await getReadUrl(creator.avatar),
    banner: await getReadUrl(creator.banner),
    logo: await getReadUrl(creator.logo),
    description: creator.description,
    flavorText: creator.flavorText,
    website: creator.website,
    // TODO v1: replace these stats with real data and remove '|| true'
    stats:
      creator?.stats || true
        ? {
            comicIssuesCount: getRandomInt(1, 30),
            totalVolume: getRandomFloatOrInt(0, 10000),
          }
        : undefined,
  };

  const creatorDto = plainToInstance(CreatorDto, plainCreatorDto);
  return creatorDto;
}

export const toCreatorDtoArray = (creators: CreatorInput[]) => {
  return Promise.all(creators.map(toCreatorDto));
};
