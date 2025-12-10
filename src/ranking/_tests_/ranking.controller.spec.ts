import { Test, TestingModule } from '@nestjs/testing';
import { RankingController } from '../ranking.controller';
import { RankingService } from '../ranking.service';

describe('RankingController', () => {
  let controller: RankingController;
  let service: RankingService;

  const mockService = {
    fetchRank: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [
        {
          provide: RankingService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RankingController>(RankingController);
    service = module.get<RankingService>(RankingService);
  });

  it('should return ranking data from service', async () => {
    const mockResult = {
      domain: 'google.com',
      labels: ['2025-12-01'],
      ranks: [10],
    };

    mockService.fetchRank.mockResolvedValue(mockResult);

    const response = await controller.get('google.com');

    expect(response).toEqual(mockResult);
    expect(mockService.fetchRank).toHaveBeenCalledWith('google.com');
  });
});
