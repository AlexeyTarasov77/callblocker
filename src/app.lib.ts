import { AddPhoneInfoDto } from "./app.dto";
import { validateOrReject } from "class-validator"
import { createReadStream } from "node:fs";
import CSV from 'papaparse';
import * as XLSX from 'xlsx';

export interface PhoneInfoImporter {
  import: () => Promise<AddPhoneInfoDto[]>
}

export class InvalidFileContentError extends Error {
  constructor() {
    super("Provided file does not contain enough data for import. Following columns must be present: phone_number, status, description")
  }
}

export class CSVImporter implements PhoneInfoImporter {
  constructor(private buf: Buffer) {
    this.buf = buf
  }
  async import(): Promise<AddPhoneInfoDto[]> {

    return new Promise((resolve, reject) => {
      CSV.parse<AddPhoneInfoDto, NodeJS.ReadableStream>(createReadStream(this.buf), {
        complete: (results, _) => {
          validateOrReject(results.data)
            .then(() => resolve(results.data))
            .catch(_ => reject(new InvalidFileContentError()))
        }
      })
    })
  }
}

export class ExcelImporter implements PhoneInfoImporter {
  constructor(private buf: Buffer) {
    this.buf = buf
  }
  async import(): Promise<AddPhoneInfoDto[]> {
    return new Promise((resolve, reject) => {
      let data: AddPhoneInfoDto[]
      const workbook = XLSX.read(this.buf, { type: 'buffer' });
      console.log("SHEETS", workbook.Sheets)
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet, { header: ['phoneNumber', 'description', 'status'], defval: '' });
      validateOrReject(data)
        .then(() => resolve(data))
        .catch(_ => reject(new InvalidFileContentError()))
    })
  }
}

