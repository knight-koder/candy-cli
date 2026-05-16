"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExampleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_example_dto_1 = require("./create-example.dto");
class UpdateExampleDto extends (0, swagger_1.PartialType)(create_example_dto_1.CreateExampleDto) {
}
exports.UpdateExampleDto = UpdateExampleDto;
//# sourceMappingURL=update-example.dto.js.map