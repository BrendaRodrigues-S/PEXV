import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { TemplateService } from './template.service';

@Controller('templates')
export class TemplateController {
  constructor(private templateService: TemplateService) {}

  @Public()
  @Get()
  findAll() {
    return this.templateService.getAll();
  }
}
