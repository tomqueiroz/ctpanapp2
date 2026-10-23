import QRCode from 'qrcode';

export const CERTIFICATE_VERIFICATION_ORIGIN = 'https://cursoanapp.org.br';

const CTP_LOGO_URL = '/assets/slots/certificate.credential.ctp-logo.png';
const ANAPP_LOGO_URL = '/assets/slots/certificate.credential.anapp-logo.png';

const COLORS = {
  blue: '#0090FF',
  blueDeep: '#075A9F',
  blueDark: '#06396B',
  orange: '#F76B15',
  ink: '#1C2024',
  muted: '#627080',
  canvas: '#FCFCFD',
  white: '#FFFFFF',
};

export interface CredentialCertificateData {
  certificate_number: string;
  completion_date?: string | null;
  full_name: string;
  verification_code?: string | null;
  is_valid?: boolean | null;
}

interface TextOptions {
  align?: CanvasTextAlign;
  color?: string;
  font?: string;
  lineHeight?: number;
  maxLines?: number;
  maxWidth?: number;
}

function normalized(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function certificateVerificationUrl(
  verificationCode: string | null | undefined,
): string {
  const code = normalized(verificationCode).toUpperCase();
  const url = new URL('/verify-certificate', CERTIFICATE_VERIFICATION_ORIGIN);
  if (code) url.searchParams.set('code', code);
  return url.toString();
}

function safeFileNumber(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]+/g, '-');
}

function formatCredentialDate(value: string | null | undefined): string {
  const normalizedValue = normalized(value);
  if (!normalizedValue) return 'Não informada';
  const date = new Date(`${normalizedValue.slice(0, 10)}T12:00:00-03:00`);
  return Number.isNaN(date.getTime())
    ? normalizedValue
    : new Intl.DateTimeFormat('pt-BR').format(date);
}

export function certificatePdfFileName(certificateNumber: string): string {
  return `Certificado-e-Carteirinha-CTP-ANAPP-${safeFileNumber(certificateNumber)}.pdf`;
}

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function fillRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
): void {
  roundedRectPath(context, x, y, width, height, radius);
  context.fillStyle = color;
  context.fill();
}

function strokeRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
  lineWidth = 1,
): void {
  roundedRectPath(context, x, y, width, height, radius);
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.stroke();
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('Não foi possível carregar a arte da carteirinha.'));
    image.src = source;
  });
}

function drawImageContain(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const renderedWidth = image.naturalWidth * ratio;
  const renderedHeight = image.naturalHeight * ratio;
  context.drawImage(
    image,
    x,
    y + (height - renderedHeight) / 2,
    renderedWidth,
    renderedHeight,
  );
}

function splitLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }

  if (current && lines.length < maxLines) {
    const consumed = lines.join(' ').split(/\s+/).filter(Boolean).length;
    const remaining = words.slice(consumed).join(' ');
    let finalLine = remaining || current;
    while (
      finalLine &&
      context.measureText(finalLine).width > maxWidth &&
      finalLine.length > 1
    ) {
      finalLine = finalLine.slice(0, -1);
    }
    if (finalLine !== remaining && finalLine.length > 1) {
      finalLine = `${finalLine.slice(0, -1)}…`;
    }
    lines.push(finalLine);
  }

  return lines;
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: TextOptions = {},
): number {
  const {
    align = 'left',
    color = COLORS.ink,
    font = '16px Inter, Arial, sans-serif',
    lineHeight = 20,
    maxLines = 1,
    maxWidth,
  } = options;
  context.save();
  context.fillStyle = color;
  context.font = font;
  context.textAlign = align;
  context.textBaseline = 'top';
  const lines = maxWidth
    ? splitLines(context, text, maxWidth, maxLines)
    : [text];
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
  context.restore();
  return lines.length * lineHeight;
}

function drawCaption(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  side: string,
  note: string,
): void {
  drawText(context, side, x, y, {
    color: COLORS.blueDeep,
    font: '900 16px Inter, Arial, sans-serif',
  });
  drawText(context, note, x + 716, y + 1, {
    align: 'right',
    color: COLORS.muted,
    font: '700 14px Inter, Arial, sans-serif',
  });
}

function drawStatus(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
): void {
  fillRoundedRect(context, x, y, 130, 46, 23, COLORS.blueDark);
  context.beginPath();
  context.arc(x + 16, y + 23, 4, 0, Math.PI * 2);
  context.fillStyle = COLORS.white;
  context.fill();
  drawText(context, label, x + 73, y + 10, {
    align: 'center',
    color: COLORS.white,
    font: '900 10px Inter, Arial, sans-serif',
    lineHeight: 13,
    maxLines: 2,
    maxWidth: 100,
  });
}

function drawField(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
): void {
  drawText(context, label, x, y, {
    color: COLORS.muted,
    font: '900 9px Inter, Arial, sans-serif',
  });
  drawText(context, value, x, y + 19, {
    color: COLORS.ink,
    font: '800 14px Inter, Arial, sans-serif',
    maxWidth,
  });
}

function drawFront(
  context: CanvasRenderingContext2D,
  certificate: CredentialCertificateData,
  ctpLogo: HTMLImageElement,
): void {
  const x = 54;
  const y = 340;
  const width = 720;
  const height = 454;

  context.save();
  context.shadowColor = 'rgba(6, 57, 107, .16)';
  context.shadowBlur = 42;
  context.shadowOffsetY = 20;
  fillRoundedRect(context, x, y, width, height, 22, COLORS.white);
  context.restore();
  strokeRoundedRect(context, x, y, width, height, 22, 'rgba(7, 90, 159, .18)');

  context.save();
  roundedRectPath(context, x, y, width, height, 22);
  context.clip();
  context.strokeStyle = 'rgba(0, 144, 255, .075)';
  context.lineWidth = 30;
  context.beginPath();
  context.ellipse(x + 710, y + 225, 150, 350, -0.28, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  drawImageContain(context, ctpLogo, x + 38, y + 30, 250, 104);
  drawText(context, 'OPERADOR(A) DE PISCINAS CERTIFICADO(A)', x + 38, y + 142, {
    color: COLORS.blueDeep,
    font: '900 13px Inter, Arial, sans-serif',
    maxWidth: 500,
  });

  const fullName = normalized(certificate.full_name).toUpperCase();
  const nameFont =
    fullName.length > 52
      ? '800 20px Montserrat, Inter, Arial, sans-serif'
      : fullName.length > 34
        ? '800 23px Montserrat, Inter, Arial, sans-serif'
        : '800 27px Montserrat, Inter, Arial, sans-serif';
  drawText(context, fullName, x + 38, y + 174, {
    color: COLORS.ink,
    font: nameFont,
    lineHeight: 29,
    maxLines: 2,
    maxWidth: 500,
  });
  drawText(
    context,
    'Certificado(a) pela ANAPP · Associação Nacional das Empresas e Profissionais de Piscinas',
    x + 38,
    y + 238,
    {
      color: COLORS.blueDeep,
      font: '700 12px Inter, Arial, sans-serif',
      lineHeight: 16,
      maxLines: 2,
      maxWidth: 480,
    },
  );

  context.fillStyle = 'rgba(7, 90, 159, .18)';
  context.fillRect(x + 38, y + 355, 500, 1);
  drawField(
    context,
    'MATRÍCULA CTP',
    normalized(certificate.certificate_number),
    x + 38,
    y + 373,
    200,
  );
  drawField(
    context,
    'CONCLUSÃO',
    formatCredentialDate(certificate.completion_date),
    x + 270,
    y + 373,
    120,
  );
  drawField(context, 'VALIDADE', 'Permanente', x + 425, y + 373, 112);
  drawStatus(
    context,
    x + 552,
    y + 38,
    certificate.is_valid === false ? 'CERTIFICAÇÃO REVOGADA' : 'CERTIFICAÇÃO ATIVA',
  );
}

function drawBack(
  context: CanvasRenderingContext2D,
  anappLogo: HTMLImageElement,
  qrImage: HTMLImageElement,
  verificationCode: string,
): void {
  const x = 810;
  const y = 340;
  const width = 720;
  const height = 454;
  const panelWidth = 245;
  const footerHeight = 54;

  context.save();
  context.shadowColor = 'rgba(6, 57, 107, .16)';
  context.shadowBlur = 42;
  context.shadowOffsetY = 20;
  fillRoundedRect(context, x, y, width, height, 22, COLORS.blueDark);
  context.restore();

  context.save();
  roundedRectPath(context, x, y, width, height, 22);
  context.clip();
  context.fillStyle = COLORS.blueDark;
  context.fillRect(x, y, width, height);
  context.fillStyle = COLORS.orange;
  context.fillRect(
    x + width - panelWidth,
    y,
    panelWidth,
    height - footerHeight,
  );
  context.fillStyle = COLORS.white;
  context.fillRect(x, y + height - footerHeight, width, footerHeight);
  context.restore();
  strokeRoundedRect(context, x, y, width, height, 22, 'rgba(7, 90, 159, .18)');

  fillRoundedRect(context, x + 38, y + 38, 100, 100, 12, COLORS.white);
  drawImageContain(context, anappLogo, x + 48, y + 48, 80, 80);

  drawText(context, 'Certificação verificada pela ANAPP.', x + 38, y + 242, {
    color: COLORS.white,
    font: '800 28px Montserrat, Inter, Arial, sans-serif',
    lineHeight: 31,
    maxLines: 2,
    maxWidth: 375,
  });
  drawText(
    context,
    'Escaneie o QR para confirmar o profissional certificado. Uma confirmação adicional pode ser solicitada à ANAPP pelo site, e-mail ou WhatsApp.',
    x + 38,
    y + 315,
    {
      color: 'rgba(255, 255, 255, .80)',
      font: '400 13px Inter, Arial, sans-serif',
      lineHeight: 18,
      maxLines: 3,
      maxWidth: 380,
    },
  );

  fillRoundedRect(context, x + 510, y + 45, 176, 176, 10, COLORS.white);
  context.drawImage(qrImage, x + 518, y + 53, 160, 160);
  drawText(context, 'VALIDAR CREDENCIAL', x + 598, y + 239, {
    align: 'center',
    color: COLORS.white,
    font: '900 12px Inter, Arial, sans-serif',
  });
  drawText(context, 'cursoanapp.org.br/verify-certificate', x + 598, y + 269, {
    align: 'center',
    color: 'rgba(255, 255, 255, .82)',
    font: '700 9px Inter, Arial, sans-serif',
    lineHeight: 13,
    maxLines: 2,
    maxWidth: 190,
  });

  drawText(context, `Código: ${verificationCode}`, x + 38, y + 420, {
    color: COLORS.blueDark,
    font: '800 12px Inter, Arial, sans-serif',
  });
  drawText(context, 'Consulta individual e revogável', x + 682, y + 420, {
    align: 'right',
    color: COLORS.muted,
    font: '800 12px Inter, Arial, sans-serif',
  });
}

export async function buildCredentialPageCanvas(
  certificate: CredentialCertificateData,
): Promise<HTMLCanvasElement> {
  const verificationCode = normalized(certificate.verification_code).toUpperCase();
  if (!verificationCode) {
    throw new Error('O certificado não possui código de verificação.');
  }

  const verificationUrl = certificateVerificationUrl(verificationCode);
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
    color: {
      dark: COLORS.blueDark,
      light: COLORS.white,
    },
  });
  const [ctpLogo, anappLogo, qrImage] = await Promise.all([
    loadImage(CTP_LOGO_URL),
    loadImage(ANAPP_LOGO_URL),
    loadImage(qrDataUrl),
  ]);
  if (document.fonts?.ready) await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = 1584;
  canvas.height = 1188;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível montar a carteirinha.');

  context.fillStyle = COLORS.canvas;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = COLORS.orange;
  fillRoundedRect(context, 54, 91, 48, 5, 3, COLORS.orange);
  drawText(context, 'CTP ANAPP · CREDENCIAL PROFISSIONAL', 116, 82, {
    color: COLORS.blueDeep,
    font: '900 18px Inter, Arial, sans-serif',
  });
  drawText(context, 'Carteirinha do profissional certificado', 54, 125, {
    color: COLORS.blueDark,
    font: '800 46px Montserrat, Inter, Arial, sans-serif',
  });
  drawText(
    context,
    'Frente e verso para apresentação digital ou impressão.',
    54,
    190,
    {
      color: COLORS.muted,
      font: '400 20px Inter, Arial, sans-serif',
    },
  );
  drawCaption(context, 58, 309, 'FRENTE', '85,60 × 53,98 mm');
  drawCaption(context, 814, 309, 'VERSO', 'QR INDIVIDUAL DE VALIDAÇÃO');
  drawFront(context, certificate, ctpLogo);
  drawBack(context, anappLogo, qrImage, verificationCode);
  return canvas;
}
