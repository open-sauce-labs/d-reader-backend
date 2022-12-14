import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RestAuthGuard } from 'src/guards/rest-auth.guard';
import {
  CreateCarouselSlideSwaggerDto,
  CreateCarouselSlideDto,
  CreateCarouselSlideFilesDto,
} from 'src/carousel/dto/create-carousel-slide.dto';
import { CarouselService } from './carousel.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  CarouselSlideDto,
  toCarouselSlideDto,
  toCarouselSlideDtoArray,
} from './dto/carousel-slide.dto';
import { plainToInstance } from 'class-transformer';
import { ApiFile } from 'src/decorators/api-file.decorator';
import { Roles, RolesGuard } from 'src/guards/roles.guard';
import { Role } from '@prisma/client';
import { UpdateCarouselSlideDto } from './dto/update-carousel-slide.dto';

@UseGuards(RestAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Carousel')
@Controller('carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) {}

  /* Create a new carousel slide */
  @Roles(Role.Superadmin)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCarouselSlideSwaggerDto })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  @Post('slides/create')
  async create(
    @Body() createCarouselSlideDto: CreateCarouselSlideDto,
    @UploadedFiles({
      transform: (val) => plainToInstance(CreateCarouselSlideFilesDto, val),
    })
    files: CreateCarouselSlideFilesDto,
  ): Promise<CarouselSlideDto> {
    const carouselSlide = await this.carouselService.create(
      createCarouselSlideDto,
      files,
    );
    return await toCarouselSlideDto(carouselSlide);
  }

  /* Get all carousel slides */
  @Get('slides/get')
  async findAll(): Promise<CarouselSlideDto[]> {
    const carouselSlides = await this.carouselService.findAll();
    return await toCarouselSlideDtoArray(carouselSlides);
  }

  /* Get specific carousel slide by unique id */
  @Get('slides/get/:id')
  async findOne(@Param('id') id: string): Promise<CarouselSlideDto> {
    const carouselSlide = await this.carouselService.findOne(+id);
    return await toCarouselSlideDto(carouselSlide);
  }

  /* Update specific carousel slide */
  @Roles(Role.Superadmin)
  @Patch('slides/update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCarouselSlideDto: UpdateCarouselSlideDto,
  ): Promise<CarouselSlideDto> {
    const updatedCarouselSlide = await this.carouselService.update(
      +id,
      updateCarouselSlideDto,
    );
    return await toCarouselSlideDto(updatedCarouselSlide);
  }

  /* Update specific carousel slides image file */
  @Roles(Role.Superadmin)
  @ApiConsumes('multipart/form-data')
  @ApiFile('image')
  @UseInterceptors(FileInterceptor('image'))
  @Patch('slides/update/:id/image')
  async updateImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<CarouselSlideDto> {
    const updatedCarouselSlide = await this.carouselService.updateFile(
      +id,
      image,
    );
    return await toCarouselSlideDto(updatedCarouselSlide);
  }

  /* Make carousel slide expire */
  @Roles(Role.Superadmin)
  @Patch('slides/expire/:id')
  async expire(@Param('id') id: string): Promise<CarouselSlideDto> {
    const expiredCarouselSlide = await this.carouselService.expire(+id);
    return await toCarouselSlideDto(expiredCarouselSlide);
  }
}
