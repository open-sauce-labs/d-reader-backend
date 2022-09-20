import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { snakeCase } from 'lodash';
import { IsSnakeCase } from 'src/decorators/IsSnakeCase';
import { ComicDto } from './comic.dto';

export class CreateComicDto extends PickType(ComicDto, [
  'name',
  'description',
  'flavorText',
  'website',
  'twitter',
  'discord',
  'telegram',
  'instagram',
  'medium',
  'tikTok',
  'youTube',
  'magicEden',
  'openSea',
]) {
  @Expose()
  @IsSnakeCase()
  @Transform(({ obj }) => snakeCase(obj.name))
  @ApiProperty({ readOnly: true, required: false })
  slug: string;
}

export class CreateComicFilesDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  thumbnail?: Express.Multer.File | null;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  pfp?: Express.Multer.File | null;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  logo?: Express.Multer.File | null;
}

export class CreateComicSwaggerDto extends IntersectionType(
  CreateComicDto,
  CreateComicFilesDto,
) {}
