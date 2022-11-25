import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { IsKebabCase } from 'src/decorators/IsKebabCase';

export class ComicIssueFilterParams {
  @IsOptional()
  @IsKebabCase()
  creatorSlug?: string;

  @IsOptional()
  @IsString()
  comicSlug?: string;

  @IsOptional()
  @IsString()
  titleSubstring?: string;

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
