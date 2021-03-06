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

import Joi from '@hapi/joi';
import BoomModel from './utils/BoomModel';
import {createRoute} from './utils/helper.mjs';
import CafeteriaController from '../../../interfaces/controllers/CafeteriaController';

const responseModel = Joi.object({
  'id': Joi.number().description('Cafeteria의 id'),
  'name': Joi.string().description('Cafeteria의 이름'),
  'display-name': Joi.string().allow('', null).description('Cafeteria 표시 이름'),
  'image-path': Joi.string().allow('', null).description('Cafeteria 이미지 경로'),
  'support-menu': Joi.boolean().description('식단 정보를 지원하는가'),
  'support-discount': Joi.boolean().description('학생 할인을 지원하는가'),
  'support-notification': Joi.boolean().description('대기번호 알림을 지원하는가'),
}).label('Cafeteria 모델');

const idParamModel = Joi.object({
  id: Joi.number().required().description('Cafeteria의 id.'),
}).label('Cafeteria id 파라미터 모델');

const getAllCafeteria = {
  method: 'GET',
  path: '/cafeteria',
  handler: CafeteriaController.getCafeteria,
  options: {
    description: '모든 Cafeteria의 배열을 요청합니다.',
    notes: ['cafeteria 테이블의 열을 모두 읽은 뒤 직렬화하여 전달합니다.'],
    tags: ['api', 'cafeteria'],
    response: {
      status: {
        200: Joi.array().items(responseModel),
        400: BoomModel,
        500: BoomModel,
      },
    },
  },
};

const getCafeteriaById = {
    method: 'GET',
    path: '/cafeteria/{id}',
    handler: CafeteriaController.getCafeteria,
    options: {
      description: '지정된 id를 가지는 Cafeteria를 요청합니다.',
      notes: ['cafeteria 테이블에서 주어진 id를 가지는 열을 읽은 뒤 직렬화하여 전달합니다.'],
      tags: ['api', 'cafeteria'],
      validate: {
        params: idParamModel,
      },
      response: {
        status: {
          200: responseModel,
          400: BoomModel,
          500: BoomModel,
        },
      },
    },
  };

export default createRoute('cafeteria', getAllCafeteria, getCafeteriaById);
