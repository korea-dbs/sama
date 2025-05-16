"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspacePath = exports.sourcesPath = exports.HostPath = exports.AndroidPath = void 0;
const path = require("path");
exports.AndroidPath = {
    Query: '/sdcard/queries',
    ExternalDB: '/data/user/0/com.android.providers.media.module/databases/external.db',
};
exports.HostPath = {
    Source: path.resolve(process.cwd(), 'sources'),
    Query: path.resolve(process.cwd(), 'sources', 'queries'),
    Workspace: '/home/ids/ssd/workspace',
};
exports.sourcesPath = path.resolve(process.cwd(), 'sources');
exports.workspacePath = '/home/ids/ssd/workspace';
//# sourceMappingURL=const.js.map