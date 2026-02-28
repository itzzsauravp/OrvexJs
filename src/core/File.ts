import fs from "node:fs/promises";
import path from "node:path";
import { IOrvexFile } from "./@orvex_types";

export class OrvexFile {
  private readonly _fieldname: string;
  private readonly _originalname: string;
  private readonly _mimetype: string;
  private readonly _size: number;
  private readonly _buffer: Buffer;
  private _customName: string | null = null;

  constructor(fileData: IOrvexFile) {
    this._fieldname = fileData.fieldname;
    this._originalname = fileData.originalname;
    this._mimetype = fileData.mimetype;
    this._size = fileData.size;
    this._buffer = fileData.buffer;
  }

  get fieldname() {
    return this._fieldname;
  }
  get originalname() {
    return this._originalname;
  }
  get mimetype() {
    return this._mimetype;
  }
  get size() {
    return this._size;
  }
  get buffer() {
    return this._buffer;
  }

  set filename(name: string) {
    if (name.trim().length === 0) throw new Error("Filename cannot be empty");
    this._customName = name;
  }

  /**
   *  Saves the file to a certain location, if location not provided stores it `pwd` under `./src/public`
   * @param destination destination directory to store the file can be absolute or relative path.
   * @returns Absolute path to where the file is stored.
   */
  public async save(destination: string = "./public"): Promise<string> {
    const targetDir = path.isAbsolute(destination)
      ? destination
      : path.join(process.cwd(), "src", destination);

    await fs.mkdir(targetDir, { recursive: true });

    const fileNameToSave = this._customName || `${Date.now()}-${this._originalname}`;
    const finalPath = path.join(targetDir, fileNameToSave);

    await fs.writeFile(finalPath, this._buffer);
    return finalPath;
  }
}

export class OrvexFileCollection extends Array<OrvexFile> {
  /**
   * Saves all files in the collection to the same directory.
   * Returns an array of paths where the files were saved.
   */
  public async saveAll(destination: string = "./public"): Promise<string[]> {
    const savePromises = this.map((file) => file.save(destination));
    return await Promise.all(savePromises);
  }
}
