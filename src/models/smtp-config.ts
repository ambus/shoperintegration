export type SMTPConfig = {
  from: string,
  host: string;
  secure?: boolean;
  port?: number;
  auth: {
    user: string;
    pass: string;
  };
  ignoreTLS?: boolean;
  tls: { rejectUnauthorized?: boolean; ciphers?: string };
};
