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

import CafeteriaRepository from '../../lib/domain/repositories/CafeteriaRepository';
import Cafeteria from '../../lib/domain/entities/Cafeteria';
import CafeteriaRepositoryImpl from '../../lib/interfaces/storage/CafeteriaRepositoryImpl';
import MenuConverter from '../../lib/interfaces/converters/MenuConverter';
import Corner from '../../lib/domain/entities/Corner';

const impl = new CafeteriaRepositoryImpl({menuConverter: new MenuConverter()});

class CafeteriaRepositoryMock extends CafeteriaRepository {
    getCafeteriaById(id) {
        return new Cafeteria({
            id: id,
            name: 'string',
            imagePath: 'string',
        });
    }

    getCornerById(id) {
        return new Corner({
            id: id,
            name: 'string',
            cafeteriaId: 1,
        });
    }

    getAllMenus(date) {
        return impl.getAllMenus(date);
    }

    getMenusByCornerId(cornerId, date = null) {
        return impl.getMenusByCornerId(cornerId, date);
    }
}

export default CafeteriaRepositoryMock;