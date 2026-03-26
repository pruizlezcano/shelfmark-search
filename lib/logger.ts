class Logger {
  name: string;
  constructor() {
    this.name = "[Shelfmark Search]";
  }

  public log(...data: any[]) {
    console.log(this.name, ...data);
  }

  public error(...data: any[]) {
    console.error(this.name, ...data);
  }
}

export const logger = new Logger();
