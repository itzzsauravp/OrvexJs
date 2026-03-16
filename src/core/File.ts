import fs from "node:fs/promises";
import path from "node:path";
import { IOrvexFile } from "./@orvex_types";
import { SIGNATURES, TEXT_MIMES } from "./@orvex_constants";

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

    // give the owner read and write permission but for other give just read
    await fs.writeFile(finalPath, this._buffer, { mode: 0o644 });
    return finalPath;
  }

  /**
   *  Validates the current OrvexFile Instance using the MagicSignature of widely used files
   * @returns boolean
   */
  public validate(): boolean {
    if (!this._buffer || this._buffer.length === 0) return false;

    const isText = TEXT_MIMES.some((prefix) => this._mimetype.startsWith(prefix));
    if (isText) return true;

    const sig = SIGNATURES.find((s) => this._mimetype.startsWith(s.mimePrefix));

    if (!sig || sig.bytes.length === 0) return true;

    try {
      const { offset, bytes } = sig;

      if (this._buffer.length < offset + bytes.length) return false;

      for (let i = 0; i < bytes.length; i++) {
        if (this._buffer[offset + i] !== bytes[i]) {
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error("OrvexFile Validation Error:", err.message);
      return false;
    }
  }

  /**
   *  Deletes the file at path `destination`
   * @param destination path to the `file` to be deleted
   */
  public static async delete(destination: string) {
    const absolutePath = path.resolve(destination);
    try {
      await fs.unlink(absolutePath);
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  }
}

export class OrvexFileCollection extends Array<OrvexFile> {
  /**
   * Filters the file object by certain mimetype
   */
  private filterByMime(search: string | string[]): OrvexFileCollection {
    const filtered = this.filter((file) => {
      const mime = file.mimetype || "";
      return Array.isArray(search) ? search.some((s) => mime.includes(s)) : mime.startsWith(search);
    });
    return OrvexFileCollection.from(filtered) as OrvexFileCollection;
  }

  /**
   * Filters the collection for image files.
   */
  public images(): OrvexFileCollection {
    return this.filterByMime("image");
  }

  /**
   * Filters the collection for documents (pdfs, word, etc.).
   */
  public docs(): OrvexFileCollection {
    return this.filterByMime(["application/pdf", "text/", "application/msword"]);
  }

  /**
   * Filters the collection for audio files.
   */
  public audio(): OrvexFileCollection {
    return this.filterByMime(["audio/"]);
  }

  /**
   * Filters the collection for video files.
   */
  public video(): OrvexFileCollection {
    return this.filterByMime(["video/", "application/x-matroska"]);
  }

  /**
   * Saves all files in the collection to the same directory.
   * Returns an array of paths where the files were saved.
   */
  public async saveAll(destination: string = "./public"): Promise<string[]> {
    const savePromises = this.map((file) => file.save(destination));
    return await Promise.all(savePromises);
  }

  /**
   *  Deletes all the files under the provided `destination`
   * @param destination path to the `folder` to be cleared
   */
  public static async deleteAll(destination: string) {
    const absolutePath = path.resolve(destination);

    try {
      const stat = await fs.stat(absolutePath);

      if (!stat.isDirectory()) {
        throw new Error("Provided path is not a directory");
      }

      const files = await fs.readdir(absolutePath);

      for (const file of files) {
        const fullPath = path.join(absolutePath, file);
        OrvexFile.delete(fullPath);
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  }

  public async getImageFiles() {
    return this.images();
  }

  public async getDocumentFiles() {
    return this.docs();
  }

  public async getAudioFiles() {
    return this.audio();
  }

  public async getVideoFiles() {
    return this.video();
  }
}
