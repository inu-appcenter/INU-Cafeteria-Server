/**
 * This file is part of INU Cafeteria.
 *
 * Copyright (C) 2020 INU Global App Center <potados99@gmail.com>
 *
 * INU Cafeteria is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * INU Cafeteria is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import resolve, {initWithOverrides} from '../../../../lib/common/di/resolve';

import DiscountTransactionValidator from '../../../../lib/domain/validators/DiscountTransactionValidator';
import DiscountTransaction from '../../../../lib/domain/entities/DiscountTransaction';
import CafeteriaValidationParams from '../../../../lib/domain/entities/CafeteriaValidationParams';
import Cafeteria from '../../../../lib/domain/entities/Cafeteria';
import UserDiscountStatus from '../../../../lib/domain/entities/UserDiscountStatus';
import modules from '../../../../lib/common/di/modules';
import TransactionRepositoryMock from '../../../mocks/TransactionRepositoryMock';
import TransactionRepository from '../../../../lib/domain/repositories/TransactionRepository';
import CafeteriaRepositoryMock from '../../../mocks/CafeteriaRepositoryMock';
import CafeteriaRepository from '../../../../lib/domain/repositories/CafeteriaRepository';
import UserRepositoryMock from '../../../mocks/UserRepositoryMock';
import UserRepository from '../../../../lib/domain/repositories/UserRepository';
import TokenManagerMock from '../../../mocks/TokenManagerMock';
import TokenManager from '../../../../lib/domain/security/TokenManager';
import moment from 'moment';
import MockDate from 'mockdate';
import MealType from '../../../../lib/domain/constants/MealType.mjs';

beforeEach(async () => {
  await initWithOverrides(modules, [
    {
      create: async (r) => new TransactionRepositoryMock(),
      as: TransactionRepository,
    },
    {
      create: async (r) => new CafeteriaRepositoryMock(),
      as: CafeteriaRepository,
    },
    {
      create: async (r) => new UserRepositoryMock(),
      as: UserRepository,
    },
    {
      create: async (r) => new TokenManagerMock(),
      as: TokenManager,
    },
  ], true);
});

describe('# isNotMalformed', () => {
  const transactionTest = async function(transaction, expectation) {
    const actual = await resolve(DiscountTransactionValidator).requestShouldBeNotMalformed(transaction);

    expect(actual).toBe(expectation);
  };

  it('should catch null transaction', async () => {
    await transactionTest(null, false);
  });

  it('should catch null mealType', async () => {
    await transactionTest(new DiscountTransaction({
      mealType: null,
      userId: 201701562,
      cafeteriaId: 1,
    }), false);
  });

  it('should catch null userId', async () => {
    await transactionTest(new DiscountTransaction({
      mealType: 1,
      userId: null,
      cafeteriaId: 1,
    }), false);
  });

  it('should catch zero userId', async () => {
    await transactionTest(new DiscountTransaction({
      mealType: 1,
      userId: 0,
      cafeteriaId: 1,
    }), false);
  });

  it('should catch negative userId', async () => {
    await transactionTest(new DiscountTransaction({
      mealType: 1,
      userId: -23,
      cafeteriaId: 1,
    }), false);
  });

  it('should catch null cafeteriaId', async () => {
    await transactionTest(new DiscountTransaction({
      mealType: 1,
      userId: 201701562,
      cafeteriaId: null,
    }), false);
  });

  it('should catch zero cafeteriaId', async () => {
    await transactionTest(new DiscountTransaction({
      mealType: 1,
      userId: 201701562,
      cafeteriaId: 0,
    }), false);
  });

  it('should catch negative cafeteriaId', async () => {
    await transactionTest(new DiscountTransaction({
      mealType: 1,
      userId: 201701562,
      cafeteriaId: -90,
    }), false);
  });
});

describe('# isInMealTime', () => {
  const mealTimeTest = async function(cafeteriaId, mealType, currentTime, expectation) {
    MockDate.set(moment(currentTime, 'hh:mm').toDate());

    const actual = await resolve(DiscountTransactionValidator).requestShouldBeInMealTime(cafeteriaId, mealType);

    expect(actual).toBe(expectation);

    MockDate.reset();
  };

  it('should catch null cafeteriaId in param', async () => {
    await mealTimeTest(null, MealType.DINNER, '18:00', false);
  });

  it('should catch negative cafeteriaId in param', async () => {
    setValidationParamsMock(1, 'token', MealType.LUNCH);

    await mealTimeTest(-2, MealType.DINNER, '18:00', false);
  });

  it('should catch null mealType in param', async () => {
    await mealTimeTest(3, null, '18:00', false);
  });

  it('should ensure that cafeteria with id 1 support meal type 2', async () => {
    setValidationParamsMock(1, 'token', MealType.LUNCH);

    await mealTimeTest(1, MealType.LUNCH, '12:00', true);
  });

  it('should ignore lunch discount request in the middle of a night', async () => {
    setValidationParamsMock(1, 'token', MealType.LUNCH);

    await mealTimeTest(1, MealType.LUNCH, '23:00', false);
  });

  it('should ensure that cafeteria with id 2 support meal type 4 and 1', async () => {
    setValidationParamsMock(2, 'token', MealType.BREAKFAST | MealType.DINNER);

    await mealTimeTest(2, MealType.BREAKFAST, '9:00', true);
    await mealTimeTest(2, MealType.DINNER, '18:00', true);
  });
});

describe('# cafeteriaSupportsDiscount', () => {
  const discountSupportTest = async function(cafeteriaId, expectation) {
    const actual = await resolve(DiscountTransactionValidator).cafeteriaShouldSupportDiscount(cafeteriaId);

    expect(actual).toBe(expectation);
  };

  it('should catch null cafeteria id', async () => {
    await discountSupportTest(null, false);
  });

  it('should catch crazy cafeteria id', async () => {
    await discountSupportTest(9872934, false);
  });

  it('should say this cafeteria does not support discount', async () => {
    setCafeteriaMock(1, 'cafeteria', 'path', true, false, true);

    await discountSupportTest(1, false);
  });

  it('should say this cafeteria supports discount but has no discount rule', async () => {
    setCafeteriaMock(5, 'cafeteria', 'path', true, true, true);
    setValidationParamsMock(3, 'token', 1 + 2 + 4);

    await discountSupportTest(5, false);
  });

  it('should say this cafeteria supports discount and has discount rule', async () => {
    setCafeteriaMock(3, 'cafeteria', 'path', true, true, true);
    setValidationParamsMock(3, 'token', 1 + 2 + 4);

    await discountSupportTest(3, true);
  });
});

describe('# userExists', () => {
  const userTest = async function(userId, expectation) {
    const actual = await resolve(DiscountTransactionValidator).userShouldExist(userId);

    expect(actual).toBe(expectation);
  };

  it('should catch null userId', async () => {
    await userTest(null, false);
  });

  it('should catch non existing userId', async () => {
    await userTest(2485728937, false);
  });

  it('should say a user exists', async () => {
    await userTest(201701562, true);
  });
});

describe('# isBarcodeActive', () => {
  const activationTest = async function(userId, duration, expectation) {
    const actual = await resolve(DiscountTransactionValidator).barcodeShouldBeActive(userId, duration);

    expect(actual).toBe(expectation);
  };

  const setUserStateMock = function(userId, lastBarcodeActivation, lastBarcodeTagging) {
    const mock = jest.fn((id) => {
      if (id === userId) {
        return new UserDiscountStatus({
          userId: userId,
          lastBarcodeActivation: lastBarcodeActivation,
          lastBarcodeTagging: lastBarcodeTagging,
        });
      } else {
        return null;
      }
    });

    resolve(DiscountTransactionValidator)
      .transactionRepository
      .getUserDiscountStatusByUserId = mock;

    return mock;
  };

  it('should catch null userId', async () => {
    await activationTest(null, 10, false);
  });

  it('should catch crazy userId', async () => {
    setUserStateMock(201701562, null, null);

    await activationTest(2489398895983, 10, false);
  });

  it('should catch null activeDurationMinute', async () => {
    await activationTest(1, null, false);
  });

  it('should say user status exists but barcode is never active', async () => {
    setUserStateMock(201701562, null, null);

    await activationTest(201701562, 10, false);
  });

  it('should say user status exists but barcode is expired', async () => {
    const twentyMinsBefore = new Date();
    twentyMinsBefore.setMinutes(twentyMinsBefore.getMinutes() - 20);

    setUserStateMock(201701562, twentyMinsBefore, null);

    await activationTest(201701562, 10, false);
  });

  it('should say barcode is active', async () => {
    const now = new Date();

    setUserStateMock(201701562, now, null);

    await activationTest(201701562, 10, true);
  });
});

describe('# isFirstToday', () => {
  const firstTest = async function(userId, cafeteriaId, expectation) {
    const actual = await resolve(DiscountTransactionValidator).discountAtThisCafeteriaShouldBeFirstToday(userId, cafeteriaId);

    expect(actual).toBe(expectation);
  };

  const setTransactionMock = function(userId, mealType, cafeteriaId) {
    const mock = jest.fn((id) => {
      if (id < 2100000000 && id === userId) {
        return [new DiscountTransaction({
          userId: userId,
          mealType: mealType,
          cafeteriaId: cafeteriaId,
        })];
      } else {
        return [];
      }
    });

    resolve(DiscountTransactionValidator)
      .transactionRepository
      .getAllTransactionsOfUserToday = mock;

    return mock;
  };

  it('should catch null userId and cafeteriaId in param', async () => {
    await firstTest(null, null, false);
  });

  it('should catch crazy userId in param', async () => {
    setTransactionMock(201701562, 2, 1);

    await firstTest(8934892389289, 1, true); // this is a right behavior
  });

  it('should say this user already made a transaction today at cafeteria with id 1', async () => {
    setTransactionMock(201701562, 2, 1);

    await firstTest(201701562, 1, false);
  });

  it('should say this user already made a transaction today but not at cafeteria with id 3', async () => {
    setTransactionMock(201701562, 2, 1);

    await firstTest(201701562, 3, true);
  });
});

describe('# barcodeNotUsedRecently', () => {
  const barcodeUsedTest = async function(userId, intervalSec, expectation) {
    const actual = await resolve(DiscountTransactionValidator).barcodeShouldNotBeUsedRecently(userId, intervalSec);

    expect(actual).toBe(expectation);
  };

  const setUserStatusMock = function(userId, lastBarcodeActivation, lastBarcodeTagging) {
    const mock = jest.fn((id) => {
      if (id > 2100000000) {
        return null;
      }

      return new UserDiscountStatus({
        userId: userId,
        lastBarcodeActivation: lastBarcodeActivation,
        lastBarcodeTagging: lastBarcodeTagging,
      });
    });

    resolve(DiscountTransactionValidator)
      .transactionRepository
      .getUserDiscountStatusByUserId = mock;

    return mock;
  };

  it('should catch null userId', async () => {
    await barcodeUsedTest(null, 0, true);
  });

  it('should catch null intervalSec', async () => {
    await barcodeUsedTest(201701562, null, true);
  });

  it('should catch NaN intervalSec', async () => {
    await barcodeUsedTest(201701562, 'hi', true);
  });

  it('should catch crazy userId', async () => {
    setUserStatusMock(201701562, null, null);

    await barcodeUsedTest(8976546576, 15, true);
  });

  it('should return true: never used', async () => {
    setUserStatusMock(201701562, null, null);

    await barcodeUsedTest(201701562, 15, true);
  });

  it('should return false: recently used just before', async () => {
    setUserStatusMock(201701562, new Date(), new Date());

    await barcodeUsedTest(201701562, 15, false);
  });

  it('should return false: used 10 sec ago', async () => {
    const tenSecBefore = new Date();
    tenSecBefore.setSeconds(tenSecBefore.getSeconds() - 10);

    setUserStatusMock(201701562, tenSecBefore, tenSecBefore);

    await barcodeUsedTest(201701562, 15, false);
  });

  it('should return true: recently not used', async () => {
    const twentySecBefore = new Date();
    twentySecBefore.setSeconds(twentySecBefore.getSeconds() - 20);

    setUserStatusMock(201701562, twentySecBefore, twentySecBefore);

    await barcodeUsedTest(201701562, 15, true);
  });
});

describe('# isTokenValid', () => {
  const tokenTest = async function(cafeteriaId, token, expectation) {
    const actual = await resolve(DiscountTransactionValidator).tokenShouldBeValid(cafeteriaId, token);

    expect(actual).toBe(expectation);
  };

  it('should catch null params', async () => {
    await tokenTest(null, null, false);
  });

  it('should catch crazy cafeteriaId', async () => {
    setValidationParamsMock(1, 'abcd', 7);

    await tokenTest(985892, 'abcd', false);
  });

  it('should work', async () => {
    setValidationParamsMock(9, 'abcd', 7);

    await tokenTest(9, 'abcd', true);
  });
});

const setValidationParamsMock = function(cafeteriaId, token, availableMealTypes) {
  const mock = jest.fn((id) => {
    if (id < 100 && id === cafeteriaId) {
      return new CafeteriaValidationParams({
        cafeteriaId: cafeteriaId,
        token: token,
        availableMealTypes: availableMealTypes,
        timeRanges: {
          breakfast: '08:30-10:30',
          lunch: '11:30-13:30',
          dinner: '17:00-20:00',
        },
      });
    } else {
      return null;
    }
  });

  resolve(DiscountTransactionValidator)
    .transactionRepository
    .getCafeteriaValidationParamsByCafeteriaId = mock;

  return mock;
};

const setCafeteriaMock = function(cafeteriaId,
                                  name,
                                  imagePath,
                                  supportMenu,
                                  supportDiscount,
                                  supportNotification) {
  const mock = jest.fn((id) => {
    if (id < 100 && id === cafeteriaId) {
      return new Cafeteria({
        id: id,
        name: name,
        imagePath: imagePath,
        supportMenu: supportMenu,
        supportDiscount: supportDiscount,
        supportNotification: supportNotification,
      });
    } else {
      return null;
    }
  });

  resolve(DiscountTransactionValidator)
    .cafeteriaRepository
    .getCafeteriaById = mock;

  return mock;
};
