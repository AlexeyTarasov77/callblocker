import { AddPhoneInfoDto } from './app.dto';
import { validateOrReject } from 'class-validator';
import { createReadStream } from 'node:fs';
import * as CSV from 'papaparse';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';

export interface PhoneInfoImporter {
  import: () => Promise<AddPhoneInfoDto[]>;
}

export class InvalidFileContentError extends Error {
  constructor() {
    super(
      'Provided file does not contain enough data for import or has invalid data. Following columns must be present: number, status, description',
    );
  }
}

export class CSVImporter implements PhoneInfoImporter {
  constructor(private buf: Buffer) {
    this.buf = buf;
  }
  async import(): Promise<AddPhoneInfoDto[]> {
    return new Promise((resolve, reject) => {
      CSV.parse<string[], NodeJS.ReadableStream>(
        Readable.from(this.buf),
        {
          complete: (results, _) => {
            let data: AddPhoneInfoDto[];
            try {
              const keys: string[] = results.data[0]
              data = results.data.slice(1).map(row =>
                // Object.fromEntries(keys.map((k, i) => [k, row[i]]))
                Object.assign(new AddPhoneInfoDto(), Object.fromEntries(keys.map((k, i) => [k, row[i]])))
              )
            } catch (err) {
              console.error(err)
              return reject(new InvalidFileContentError())
            }
            console.log("CSV DATA", data)
            const validationPromise = new Promise((resolve, reject) => {
              data.forEach(d => validateOrReject(d)
                .then(res => resolve(res))
                .catch((err) => {
                  console.error(err)
                  reject(err)
                }))

            })
            validationPromise.then(_ => resolve(data)).catch(_ => reject(new InvalidFileContentError()))
          },
          error: (error, _) => {
            console.error("Failed to parse CSV", error)
            throw error
          },
        },
      );
    });
  }
}

export class ExcelImporter implements PhoneInfoImporter {
  constructor(private buf: Buffer) {
    this.buf = buf;
  }
  async import(): Promise<AddPhoneInfoDto[]> {
    return new Promise((resolve, reject) => {
      let data: AddPhoneInfoDto[];
      const workbook = XLSX.read(this.buf, { type: 'buffer' });
      console.log('SHEETS', workbook.Sheets);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet, {
        header: ['phoneNumber', 'description', 'status'],
        defval: '',
      });
      validateOrReject(data)
        .then(() => resolve(data))
        .catch((_) => reject(new InvalidFileContentError()));
    });
  }
}
