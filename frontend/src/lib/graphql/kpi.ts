export const GET_KPI_SNAPSHOT_QUERY = `
  query GetKpiSnapshot {
    getKpiSnapshot {
      computedAt
      maritime {
        totalVessels
        delayedVessels
        averageDelayTimeHours
      }
      financial {
        totalCargoValue
        estimatedOilValue
        estimatedLngValue
      }
      alerts {
        id
        type
        severity
        message
        createdAt
      }
    }
  }
`;

export const KPI_UPDATED_SUBSCRIPTION = `
  subscription KpiUpdated {
    kpiUpdated {
      computedAt
      maritime {
        totalVessels
        delayedVessels
        averageDelayTimeHours
      }
      financial {
        totalCargoValue
        estimatedOilValue
        estimatedLngValue
      }
      alerts {
        id
        type
        severity
        message
        createdAt
      }
    }
  }
`;
