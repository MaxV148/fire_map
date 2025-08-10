import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { Tag } from './entities/tag.entity';
import {User} from "../users/entities/user.entity";

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(
    createTagDto: CreateTagDto,
    userId: number,
  ): Promise<TagResponseDto> {
    // Prüfe ob der User existiert
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }

    const tag = new Tag();
    tag.name = createTagDto.name;
    tag.createdBy = user;

    const savedTag = await this.tagRepository.save(tag);
    
    

    return this.mapToResponseDto(savedTag);
  }

  private mapToResponseDto(tag: Tag): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }

  async findAll(): Promise<TagResponseDto[]> {
    const tags = await this.tagRepository.find();
    return tags.map((tag) => this.mapToResponseDto(tag));
  }

  async findOne(id: number): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findOne({ 
      where: { id },
    });
    if (!tag) {
      throw new Error('Tag nicht gefunden');
    }
    return this.mapToResponseDto(tag);
  }

  async update(
    id: number,
    updateTagDto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new Error('Tag nicht gefunden');
    }
    await this.tagRepository.update(id, { name: updateTagDto.name });
    const updatedTag = await this.tagRepository.findOne({ where: { id } });
    if (!updatedTag) {
      throw new Error('Tag nicht gefunden');
    }
    return this.mapToResponseDto(updatedTag);
  }

  async remove(id: number): Promise<void> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new Error('Tag nicht gefunden');
    }
    await this.tagRepository.remove(tag);
  }
}
