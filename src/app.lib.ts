import { plainToInstance } from 'class-transformer';
import { AddPhoneInfoDto } from './app.dto';
import { validateOrReject } from 'class-validator';
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

const validateRows = async (data: object[]): Promise<void> => {
  for (const d of data) {
    await validateOrReject(d)
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
                Object.assign(new AddPhoneInfoDto(), Object.fromEntries(keys.map((k, i) => [k, row[i]])))
              )
            } catch (err) {
              console.error(err)
              return reject(new InvalidFileContentError())
            }
            validateRows(data).then(_ => resolve(data)).catch(err => {
              console.error("Error validating csv data", err)
              reject(new InvalidFileContentError())

            })
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
      let dtos: AddPhoneInfoDto[];
      const workbook = XLSX.read(this.buf, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      dtos = XLSX.utils.sheet_to_json(sheet).map(data => plainToInstance(AddPhoneInfoDto, data))
      validateRows(dtos).then(_ => resolve(dtos)).catch(err => {
        console.error("Error validating excel data", err)
        reject(new InvalidFileContentError())
      })
    });
  }
}
