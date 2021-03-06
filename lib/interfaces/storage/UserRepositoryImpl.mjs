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

import UserRepository from '../../domain/repositories/UserRepository';
import User from '../../domain/entities/User';

import seq from 'sequelize';
import RemoteLoginResult from '../../domain/constants/RemoteLoginResult';
import logger from '../../common/utils/logger';

const {Sequelize} = seq;

/**
 * Implementation of UserRepository.
 */
class UserRepositoryImpl extends UserRepository {
  constructor({db, localDataSource, remoteDataSource}) {
    super();

    this.db = db;
    this.userModel = this.db.model('user');

    this.userDataSources = [localDataSource, remoteDataSource];
  }

  async getLoginResult(id, password) {
    if (!id || !password) {
      return RemoteLoginResult.FUCK;
    }

    for (const dataSource of this.userDataSources) {
      if (dataSource.userExists(id)) {
        logger.verbose(`User ${id} exists.`);

        return dataSource.fetchLoginResult(id, password);
      }
    }

    logger.verbose(`No user(${id}) found in both local and remote repository!`);

    return RemoteLoginResult.FUCK;
  }

  async findUserById(id) {
    if (!id) {
      return null;
    }

    const seqUser = await this.userModel.findByPk(id);

    if (!seqUser) {
      return null;
    }

    return new User({
      id: seqUser.id,
      token: seqUser.token,
      barcode: seqUser.barcode,
    });
  }

  async addOrUpdateUser(id, {token = null, barcode = null}) {
    if (!id) {
      return 0;
    }

    const newObject = {id: id};

    if (token) {
      newObject.token = token;
    }
    if (barcode) {
      newObject.barcode = barcode;
    }

    return await this.userModel.upsert(newObject);
  }

  async updateLastLoginTimestamp(id) {
    if (!id) {
      return 0;
    }

    return await this.userModel.upsert({
      id: id,
      last_login: Sequelize.fn('NOW'),
    });
  }

  async updateLastLogoutTimestamp(id) {
    if (!id) {
      return 0;
    }

    return await this.userModel.upsert({
      id: id,
      last_logout: Sequelize.fn('NOW'),
    });
  }
}

export default UserRepositoryImpl;
