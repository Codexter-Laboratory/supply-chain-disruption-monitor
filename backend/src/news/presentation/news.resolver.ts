import { UsePipes } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { graphqlArgsValidationPipe } from '../../common/utils/graphql-args-validation.pipe';
import { NewsApplicationService } from '../application/news.application.service';
import { NewsItemGraphqlType } from './news-item.graphql-types';
import { RecentNewsArgs } from './news-queries.args';
import { toNewsItemGraphql } from './news-item.dto-mapper';

@Resolver(() => NewsItemGraphqlType)
@UsePipes(graphqlArgsValidationPipe)
export class NewsResolver {
  constructor(private readonly news: NewsApplicationService) {}

  @Query(() => [NewsItemGraphqlType], { name: 'recentNews' })
  async recentNews(
    @Args() args: RecentNewsArgs,
  ): Promise<NewsItemGraphqlType[]> {
    const rows = await this.news.listRecent(args.limit);
    return rows.map(toNewsItemGraphql);
  }
}
