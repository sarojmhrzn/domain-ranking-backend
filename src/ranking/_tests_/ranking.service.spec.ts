import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from '../ranking.service';
import { getModelToken } from '@nestjs/sequelize';
import { Ranking } from '../ranking.model';

describe('RankingService', () => {
  let service: RankingService;

  const mockRankingModel = {
    findAll: jest.fn(),
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: getModelToken(Ranking),
          useValue: mockRankingModel,
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
    jest.clearAllMocks();
  });

  it('should return cached results when found and recent', async () => {
    const cachedRows = [
      {
        domain: 'google.com',
        rank: 5,
        date: '2025-12-01',
        updatedAt: new Date(), // recent
      },
    ];

    mockRankingModel.findAll.mockResolvedValue(cachedRows);

    const result = await service.fetchRank('google.com');

    expect(result).toEqual({
      domain: 'google.com',
      labels: ['2025-12-01'],
      ranks: [5],
    });

    expect(mockRankingModel.findAll).toHaveBeenCalled();
    expect(mockRankingModel.destroy).not.toHaveBeenCalled();
  });

  it('should fetch from Tranco API and store results when cache is empty', async () => {
    mockRankingModel.findAll.mockResolvedValue([]);

    const apiResponse = {
      ranks: [
        { date: '2025-12-01', rank: 10 },
        { date: '2025-12-02', rank: 8 },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(apiResponse),
    });

    const result = await service.fetchRank('google.com');

    expect(mockRankingModel.destroy).toHaveBeenCalledWith({
      where: { domain: 'google.com' },
    });

    expect(mockRankingModel.bulkCreate).toHaveBeenCalledWith([
      { domain: 'google.com', date: '2025-12-01', rank: 10 },
      { domain: 'google.com', date: '2025-12-02', rank: 8 },
    ]);

    expect(result).toEqual({
      domain: 'google.com',
      labels: ['2025-12-01', '2025-12-02'],
      ranks: [10, 8],
    });
  });
  it('should throw an error when Tranco API returns invalid data', async () => {
    mockRankingModel.findAll.mockResolvedValue([]);

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ invalid: true }),
    });

    await expect(service.fetchRank('google.com')).rejects.toThrow(
      'Invalid response from Tranco API',
    );
  });
});
