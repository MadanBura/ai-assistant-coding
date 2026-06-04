/**
 * @file Usage Aggregator Backend TypeScript Jest Tests
 * @feature FEAT-MTR-02
 */

import { USAGE_LOG } from '../../src/models';

describe('Usage Aggregator - Backend [FEAT-MTR-02]', () => {
  
  beforeEach(async () => {
    await USAGE_LOG.destroy({ where: {} });
  });

  /**
   * @id TC-BE-MTR-02-01
   * @requirement FR-MTR-02-01, FR-MTR-02-02
   * @acceptance AC-MTR-02-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-MTR-02-01: Aggregate total logs using SUM model parameters correctly', async () => {
    await USAGE_LOG.bulkCreate([
      { subscription_id: 'sub_92k02kasj8', usage_metric: 'api_calls', quantity: 100, recorded_at: new Date() },
      { subscription_id: 'sub_92k02kasj8', usage_metric: 'api_calls', quantity: 50, recorded_at: new Date() }
    ]);

    const aggregator = require('../../src/services/aggregatorService');
    const total = await aggregator.calculateAggregate('sub_92k02kasj8', 'api_calls', 'SUM', new Date(Date.now() - 3600000), new Date());

    expect(total).toBe(150);
  });

  /**
   * @id TC-BE-MTR-02-02
   * @requirement FR-MTR-02-01
   * @acceptance AC-MTR-02-01
   * @priority HIGH
   * @type Functional
   */
  test('TC-BE-MTR-02-02: Aggregate logs using MAX, AVG, and LATEST parameters correctly', async () => {
    const logTime = Date.now();
    await USAGE_LOG.bulkCreate([
      { subscription_id: 'sub_92k02kasj8', usage_metric: 'active_nodes', quantity: 5, recorded_at: new Date(logTime - 2000) },
      { subscription_id: 'sub_92k02kasj8', usage_metric: 'active_nodes', quantity: 12, recorded_at: new Date(logTime - 1000) },
      { subscription_id: 'sub_92k02kasj8', usage_metric: 'active_nodes', quantity: 8, recorded_at: new Date(logTime) }
    ]);

    const aggregator = require('../../src/services/aggregatorService');
    const start = new Date(logTime - 5000);
    const end = new Date(logTime + 1000);

    const max = await aggregator.calculateAggregate('sub_92k02kasj8', 'active_nodes', 'MAX', start, end);
    const avg = await aggregator.calculateAggregate('sub_92k02kasj8', 'active_nodes', 'AVG', start, end);
    const latest = await aggregator.calculateAggregate('sub_92k02kasj8', 'active_nodes', 'LATEST', start, end);

    expect(max).toBe(12);
    expect(avg).toBeCloseTo(8.3333, 4);
    expect(latest).toBe(8);
  });
});
