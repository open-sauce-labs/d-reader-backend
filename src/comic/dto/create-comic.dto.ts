import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { IsOptionalUrl } from 'src/decorators/IsOptionalUrl';
import { IsKebabCase } from 'src/decorators/IsKebabCase';
import { kebabCase } from 'lodash';

export class CreateComicDto {
  @IsNotEmpty()
  @MaxLength(48)
  name: string;

  @Expose()
  @IsKebabCase()
  @Transform(({ obj }) => kebabCase(obj.name))
  @ApiProperty({ readOnly: true, required: false })
  slug: string;

  @IsBoolean()
  @Transform(({ value }) =>
    typeof value === 'string' ? Boolean(value) : value,
  )
  @ApiProperty({ default: true })
  isOngoing: boolean;

  @IsBoolean()
  @Transform(({ value }) =>
    typeof value === 'string' ? Boolean(value) : value,
  )
  @ApiProperty({ default: true })
  isMatureAudience: boolean;

  @IsOptional()
  @MaxLength(256)
  description?: string;

  @IsOptional()
  @MaxLength(128)
  flavorText?: string;

  @IsOptionalUrl()
  website?: string;

  @IsOptionalUrl()
  twitter?: string;

  @IsOptionalUrl()
  discord?: string;

  @IsOptionalUrl()
  telegram?: string;

  @IsOptionalUrl()
  instagram?: string;

  @IsOptionalUrl()
  tikTok?: string;

  @IsOptionalUrl()
  youTube?: string;

  @Expose()
  @IsArray()
  @IsOptional()
  @Type(() => String)
  @ApiProperty({ type: [String], required: false })
  @Transform(({ value }: { value: string[] | string }) => {
    if (value && typeof value === 'string') {
      return value.split(',');
    } else return value || [];
  })
  genres: string[];
}

export class CreateComicFilesDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @Transform(({ value }) => value[0])
  @IsOptional()
  cover?: Express.Multer.File | null;

  @ApiProperty({ type: 'string', format: 'binary' })
  @Transform(({ value }) => value[0])
  @IsOptional()
  pfp?: Express.Multer.File | null;

  @ApiProperty({ type: 'string', format: 'binary' })
  @Transform(({ value }) => value[0])
  @IsOptional()
  logo?: Express.Multer.File | null;
}

export class CreateComicSwaggerDto extends IntersectionType(
  CreateComicDto,
  CreateComicFilesDto,
) {}
