import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('NewsItem')
export class NewsItemGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  source!: string;

  @Field()
  timestamp!: Date;

  @Field()
  summary!: string;

  @Field()
  url!: string;
}
