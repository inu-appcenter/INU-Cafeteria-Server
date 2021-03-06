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

import CafeteriaRepositoryImpl from '../../lib/interfaces/storage/CafeteriaRepositoryImpl';
import DirectMenuConverter from '../../lib/interfaces/converters/DirectMenuConverter';
import CafeteriaRemoteDataSource from '../../lib/interfaces/storage/CafeteriaRemoteDataSource';
import CoopRepositoryImpl from '../../lib/interfaces/storage/CoopRepositoryImpl';
import ParseRegexRepositoryImpl from '../../lib/interfaces/storage/ParseRegexRepositoryImpl.mjs';
import sequelize from '../../lib/infrastructure/database/sequelize.mjs';

describe('# getAllMenus', () => {
  it('should get menus', async () => {
    const repo = getRepository();
    const result = await repo.getAllMenus('20201222');

    // Just see :)
    console.log(result);
  });
});

const getRepository = function() {
  // Below is a REAL repository with actual DB.
  return new CafeteriaRepositoryImpl({
    db: sequelize,
    remoteDataSource: new CafeteriaRemoteDataSource({coopRepo: new CoopRepositoryImpl()}),
    menuConverter: new DirectMenuConverter({
      parseRegexRepository: new ParseRegexRepositoryImpl({
        db: sequelize,
      }),
    }),
  });
};
