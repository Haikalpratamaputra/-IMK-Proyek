import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, Wallet, QrCode, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PaymentInstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: string;
  amount: number;
}

export default function PaymentInstructionsModal({ 
  open, 
  onOpenChange, 
  paymentMethod, 
  amount 
}: PaymentInstructionsModalProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Disalin!",
      description: `${label} telah disalin ke clipboard`,
    });
  };

  const getInstructions = () => {
    switch (paymentMethod) {
      case "qris":
        return {
          icon: QrCode,
          title: "Pembayaran QRIS",
          steps: [
            "Buka aplikasi mobile banking atau e-wallet Anda",
            "Pilih menu Scan QR atau QRIS",
            "Scan kode QR yang ditampilkan",
            "Pastikan nominal pembayaran sesuai",
            "Masukkan PIN Anda untuk konfirmasi",
            "Klik tombol 'Konfirmasi Pembayaran' setelah pembayaran berhasil"
          ],
          note: "QR Code akan kedaluwarsa dalam 10 menit"
        };

      case "gopay":
        return {
          icon: Wallet,
          title: "Pembayaran GoPay",
          steps: [
            "Buka aplikasi Gojek",
            "Pilih menu GoPay",
            "Pilih 'Bayar' atau 'Transfer'",
            "Masukkan nomor merchant: 0812-3456-7890",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN GoPay Anda",
            "Simpan bukti pembayaran",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          merchantInfo: {
            label: "Nomor Merchant",
            value: "0812-3456-7890",
            name: "Cool TopUp Store"
          }
        };

      case "ovo":
        return {
          icon: Wallet,
          title: "Pembayaran OVO",
          steps: [
            "Buka aplikasi OVO",
            "Pilih menu 'Transfer'",
            "Pilih 'Ke Nomor HP'",
            "Masukkan nomor tujuan: 0812-3456-7890",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN OVO Anda",
            "Simpan bukti pembayaran",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          merchantInfo: {
            label: "Nomor OVO",
            value: "0812-3456-7890",
            name: "Cool TopUp Store"
          }
        };

      case "dana":
        return {
          icon: Wallet,
          title: "Pembayaran DANA",
          steps: [
            "Buka aplikasi DANA",
            "Pilih menu 'Kirim'",
            "Masukkan nomor tujuan: 0812-3456-7890",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN DANA Anda",
            "Simpan bukti pembayaran",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          merchantInfo: {
            label: "Nomor DANA",
            value: "0812-3456-7890",
            name: "Cool TopUp Store"
          }
        };

      case "shopeepay":
        return {
          icon: Wallet,
          title: "Pembayaran ShopeePay",
          steps: [
            "Buka aplikasi Shopee",
            "Pilih ShopeePay di halaman utama",
            "Pilih 'Transfer' atau 'Kirim'",
            "Masukkan nomor tujuan: 0812-3456-7890",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN ShopeePay Anda",
            "Simpan bukti pembayaran",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          merchantInfo: {
            label: "Nomor ShopeePay",
            value: "0812-3456-7890",
            name: "Cool TopUp Store"
          }
        };

      case "linkaja":
        return {
          icon: Wallet,
          title: "Pembayaran LinkAja",
          steps: [
            "Buka aplikasi LinkAja",
            "Pilih menu 'Kirim Uang'",
            "Pilih 'Ke Sesama LinkAja'",
            "Masukkan nomor tujuan: 0812-3456-7890",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN LinkAja Anda",
            "Simpan bukti pembayaran",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          merchantInfo: {
            label: "Nomor LinkAja",
            value: "0812-3456-7890",
            name: "Cool TopUp Store"
          }
        };

      case "bca":
        return {
          icon: CreditCard,
          title: "Transfer Bank BCA",
          steps: [
            "Login ke BCA Mobile atau KlikBCA",
            "Pilih menu 'Transfer'",
            "Pilih 'Transfer ke BCA'",
            "Masukkan nomor rekening: 1234567890",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN BCA Anda",
            "Simpan bukti transfer",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          accountInfo: {
            bank: "BCA",
            accountNumber: "1234567890",
            accountName: "Cool TopUp Store"
          }
        };

      case "mandiri":
        return {
          icon: CreditCard,
          title: "Transfer Bank Mandiri",
          steps: [
            "Login ke Mandiri Online atau Livin'",
            "Pilih menu 'Transfer'",
            "Pilih 'Transfer ke Sesama Mandiri'",
            "Masukkan nomor rekening: 9876543210",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN Mandiri Anda",
            "Simpan bukti transfer",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          accountInfo: {
            bank: "Mandiri",
            accountNumber: "9876543210",
            accountName: "Cool TopUp Store"
          }
        };

      case "bni":
        return {
          icon: CreditCard,
          title: "Transfer Bank BNI",
          steps: [
            "Login ke BNI Mobile Banking",
            "Pilih menu 'Transfer'",
            "Pilih 'Transfer Antar Rekening BNI'",
            "Masukkan nomor rekening: 5551234567",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN BNI Anda",
            "Simpan bukti transfer",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          accountInfo: {
            bank: "BNI",
            accountNumber: "5551234567",
            accountName: "Cool TopUp Store"
          }
        };

      case "bri":
        return {
          icon: CreditCard,
          title: "Transfer Bank BRI",
          steps: [
            "Login ke BRImo atau BRI Mobile",
            "Pilih menu 'Transfer'",
            "Pilih 'Transfer Sesama BRI'",
            "Masukkan nomor rekening: 4445678901",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN BRI Anda",
            "Simpan bukti transfer",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          accountInfo: {
            bank: "BRI",
            accountNumber: "4445678901",
            accountName: "Cool TopUp Store"
          }
        };

      case "cimb":
        return {
          icon: CreditCard,
          title: "Transfer Bank CIMB Niaga",
          steps: [
            "Login ke OCTO Mobile",
            "Pilih menu 'Transfer'",
            "Pilih 'Transfer ke Rekening CIMB Niaga'",
            "Masukkan nomor rekening: 7778901234",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN CIMB Anda",
            "Simpan bukti transfer",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          accountInfo: {
            bank: "CIMB Niaga",
            accountNumber: "7778901234",
            accountName: "Cool TopUp Store"
          }
        };

      case "permata":
        return {
          icon: CreditCard,
          title: "Transfer Bank Permata",
          steps: [
            "Login ke PermataNet atau PermataMobile X",
            "Pilih menu 'Transfer'",
            "Pilih 'Transfer ke Sesama Permata'",
            "Masukkan nomor rekening: 3332345678",
            `Transfer sejumlah Rp ${amount.toLocaleString("id-ID")}`,
            "Masukkan PIN Permata Anda",
            "Simpan bukti transfer",
            "Klik 'Konfirmasi Pembayaran' di halaman ini"
          ],
          accountInfo: {
            bank: "Permata",
            accountNumber: "3332345678",
            accountName: "Cool TopUp Store"
          }
        };

      default:
        return null;
    }
  };

  const instructions = getInstructions();

  if (!instructions) return null;

  const Icon = instructions.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            {instructions.title}
          </DialogTitle>
          <DialogDescription>
            Ikuti langkah-langkah berikut untuk menyelesaikan pembayaran
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Account/Merchant Info */}
          {instructions.accountInfo && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary space-y-2">
              <h3 className="font-semibold text-sm">Informasi Rekening</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bank:</span>
                  <span className="font-semibold">{instructions.accountInfo.bank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nomor Rekening:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{instructions.accountInfo.accountNumber}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(instructions.accountInfo!.accountNumber, "Nomor rekening")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Atas Nama:</span>
                  <span className="font-semibold">{instructions.accountInfo.accountName}</span>
                </div>
              </div>
            </div>
          )}

          {instructions.merchantInfo && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary space-y-2">
              <h3 className="font-semibold text-sm">Informasi Merchant</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{instructions.merchantInfo.label}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{instructions.merchantInfo.value}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(instructions.merchantInfo!.value, instructions.merchantInfo!.label)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Atas Nama:</span>
                  <span className="font-semibold">{instructions.merchantInfo.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Pembayaran:</span>
              <span className="text-2xl font-bold text-primary">Rp {amount.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Langkah Pembayaran:</h3>
            <ol className="space-y-2">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Note */}
          {instructions.note && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                ⚠️ {instructions.note}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
