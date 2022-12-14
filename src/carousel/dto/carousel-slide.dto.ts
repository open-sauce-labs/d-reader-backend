import { plainToInstance, Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { CarouselSlide, CarouselLocation } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { getReadUrl } from 'src/aws/s3client';

export class CarouselSlideDto {
  @IsPositive()
  id: number;

  @IsUrl()
  image: string;

  @IsNumber()
  priority: number;

  @IsString()
  link: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @Transform(({ obj }) => !!obj.publishedAt)
  isPublished: boolean;

  @Transform(({ obj }) => !!obj.expiredAt)
  isExpired: boolean;

  @IsEnum(CarouselLocation)
  @ApiProperty({ enum: CarouselLocation })
  location: CarouselLocation;
}

export async function toCarouselSlideDto(slide: CarouselSlide) {
  const plainSlideDto: CarouselSlideDto = {
    id: slide.id,
    image: await getReadUrl(slide.image),
    priority: slide.priority,
    link: slide.link,
    title: slide.title,
    subtitle: slide.subtitle,
    isPublished: !!slide.publishedAt,
    isExpired: !!slide.expiredAt,
    location: slide.location,
  };

  const slideDto = plainToInstance(CarouselSlideDto, plainSlideDto);
  return slideDto;
}

export const toCarouselSlideDtoArray = (slides: CarouselSlide[]) => {
  return Promise.all(slides.map(toCarouselSlideDto));
};
