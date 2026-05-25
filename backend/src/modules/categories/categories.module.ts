import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { Todo } from '../todos/todo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Todo])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesModule],
  exports: [CategoriesService],
})
export class CategoriesModule implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.categoryRepo.count();
    if (count === 0) {
      await this.categoryRepo.save([
        { name: 'Work' },
        { name: 'Personal' },
        { name: 'Shopping' },
      ]);
      console.log('✅ Seeded 3 default categories');
    }
  }
}
