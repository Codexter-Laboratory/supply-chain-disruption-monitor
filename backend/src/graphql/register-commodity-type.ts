import { CommodityType } from '@supply-chain/maritime-intelligence';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(CommodityType, {
  name: 'CommodityType',
});
