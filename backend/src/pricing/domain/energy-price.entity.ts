import { CommodityType } from '@supply-chain/maritime-intelligence';
import { InvalidDomainStateError } from '../../common/errors/domain.error';

export type EnergyPriceProps = {
  readonly id: string;
  readonly type: CommodityType;
  readonly value: string;
  readonly timestamp: Date;
};

const COMMODITY_SET = new Set<string>(Object.values(CommodityType));
const VALUE_PATTERN = /^\d+(\.\d+)?$/;

/** Append-only price observation (historical series). */
export class EnergyPrice {
  private constructor(private readonly props: EnergyPriceProps) {}

  static restore(raw: EnergyPriceProps): EnergyPrice {
    const id = raw.id?.trim();
    if (!id) {
      throw new InvalidDomainStateError('EnergyPrice id must be non-empty');
    }
    if (!COMMODITY_SET.has(raw.type)) {
      throw new InvalidDomainStateError(`Unknown energy price commodity: ${raw.type}`);
    }
    const value = raw.value?.trim();
    if (!value || !VALUE_PATTERN.test(value)) {
      throw new InvalidDomainStateError(
        `EnergyPrice value must be a non-negative decimal string: ${raw.value}`,
      );
    }
    if (!(raw.timestamp instanceof Date) || Number.isNaN(raw.timestamp.getTime())) {
      throw new InvalidDomainStateError('EnergyPrice timestamp must be a valid Date');
    }
    return new EnergyPrice({
      id,
      type: raw.type,
      value,
      timestamp: raw.timestamp,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get type(): CommodityType {
    return this.props.type;
  }
  get value(): string {
    return this.props.value;
  }
  get timestamp(): Date {
    return this.props.timestamp;
  }
}
