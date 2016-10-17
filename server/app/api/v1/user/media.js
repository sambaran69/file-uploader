'use strict';

const express   = require('express');
const multer    = require('multer');
const _         = require('lodash');
const payload   = require(global.appRoot + '/app/services/payload').v1;
const User      = require(global.appRoot + '/app/services/user');
const Media     = require(global.appRoot + '/app/services/media');
const upload    = multer({inMemory: true});
const router    = express.Router();

/**
 * @api {get} /api/v1/user/:userId/media GET Vendor Media
 * @apiName GetAllUserMedia
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} userId User's unique ID
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "result": "success",
 *    "detail": "",
 *    "data": [
 *      {
 *        "userId": 1,
 *        "id": 3,
 *        "name": "622e92bef081e258555fa51de41fa99edcc8821c",
 *        "mime": "image/jpeg",
 *        "path": "flamingo/image",
 *        "ext": "jpg",
 *        "size": 49752,
 *        "private": 0,
 *        "secure": 0,
 *        "createdAt": "2015-11-04T01:05:09.000Z",
 *        "updatedAt": "2015-11-04T01:05:09.000Z",
 *        "tags": [
 *          {
 *            "id": 1,
 *            "mediaId": 1,
 *            "tag": "avatar",
 *            "createdAt": "2015-01-01T03:00:00.000Z",
 *            "updatedAt": "2015-08-07T22:00:00.000Z"
 *          }
 *        ]
 *      }
 *    ],
 *    "request": {
 *    "method": "GET",
 *    "path": "/api/v1/user/1/media",
 *    "body": {}
 *    }
 *  }
 *
 * @apiErrorExample {json} Error-Response:
 * {
 *   "result": "fail",
 *   "detail": "",
 *   "request": {
 *     "method": "GET",
 *     "path": "/api/v1/user/8/media",
 *     "body": {}
 *   },
 *   "error": {
 *     "description": "No media objects found for user ID: 8"
 *   }
 * }
 *
 */
router.get('/', function (req, res) {
    Media.provider().getAllByuserId(req.userId).then((response) => {
        if (!response) {
            res.status(404).json(payload.fail(req, null, `No media objects found for user ID: ${req.userId}`));
        } else {
            res.json(payload.success(req, response));
        }
    }).catch(function (e) {
        let error = new Error(e);
        res.status(500).json(payload.fail(req, error.message, 'Could not retrieve media objects'));
    });
});

/**
 * @api {get} /api/v1/user/:userId/media/:id GET Single Vendor Media
 * @apiName GetOneUserMedia
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {Number} userId Vendor's unique ID
 * @apiParam {Number} id Media's ID
 *
 * @apiSuccessExample Success-Response:
 *  {
 *    "result": "success",
 *    "detail": "",
 *    "data": [
 *      {
 *        "userId": 1,
 *        "id": 3,
 *        "name": "622e92bef081e258555fa51de41fa99edcc8821c",
 *        "mime": "image/jpeg",
 *        "path": "flamingo/image",
 *        "ext": "jpg",
 *        "size": 49752,
 *        "private": 0,
 *        "secure": 0,
 *        "createdAt": "2015-11-04T01:05:09.000Z",
 *        "updatedAt": "2015-11-04T01:05:09.000Z",
 *        "tags": [
 *          {
 *            "id": 1,
 *            "mediaId": 1,
 *            "tag": "avatar",
 *            "createdAt": "2015-01-01T03:00:00.000Z",
 *            "updatedAt": "2015-08-07T22:00:00.000Z"
 *          }
 *        ]
 *      }
 *    ],
 *    "request": {
 *    "method": "GET",
 *    "path": "/api/v1/user/1/media/3",
 *    "body": {}
 *    }
 *  }
 *
 * @apiErrorExample {json} Error-Response:
 * {
 *   "result": "fail",
 *   "detail": "",
 *   "request": {
 *     "method": "GET",
 *     "path": "/api/v1/user/1/media/55",
 *     "body": {}
 *   },
 *   "error": {
 *     "description": "No media objects found with ID: 55"
 *   }
 * }
 */
router.get('/:id', function (req, res) {
    Media.provider().getOne(req.params.id).then((response) => {
        if (!response) {
            res.status(404).json(payload.fail(req, null, `No media objects found with ID: ${req.params.id}`));
        } else {
            res.json(payload.success(req, response));
        }
    }).catch(function (e) {
        let error = new Error(e);
        res.status(500).json(payload.fail(req, error.message, 'Could not retrieve media object'));
    });
});

/**
 * POST /api/v1/user/:userId/media
 *
 * Create new media object
 */
router.post('/', upload.single('media'), function (req, res) {
    User.provider().getOne(req.userId).then(function (user) {
        Media.stream().upload(user.name, req.file.buffer).then((data) => {

            // Attempt to save uploaded files
            Media.trans().create(data.response, req.userId).then((responseData) => {
                let response = responseData.response;
                if (!_.isArray(response)) {
                    response = [response];
                }

                res.json(payload.success(req, response));
            }).catch((e) => {
                let error = new Error(e);
                res.status(500).json(payload.fail(req, error.message, 'Could not create new media item'));
            });

        });
    }).catch(function (e) {
        let error = new Error(e);
        res.status(500).json(payload.fail(req, error.message, 'Could not create new media item'));
    });

});

module.exports = router;
