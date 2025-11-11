import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, XCircle, AlertCircle, Calendar, CreditCard, Package, Trophy } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  game_id: string;
  product_id: string;
  user_game_id: string;
  status: string;
  total_price: number;
  payment_method: string;
  points_earned: number;
  created_at: string;
  games: { name: string };
  products: { name: string };
}

interface TransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

const getStatusConfig = (status: string) => {
  const configs = {
    success: { icon: CheckCircle2, label: "Berhasil", color: "text-green-500", bgColor: "bg-green-500/10" },
    pending: { icon: Clock, label: "Menunggu", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
    failed: { icon: XCircle, label: "Gagal", color: "text-red-500", bgColor: "bg-red-500/10" },
    expired: { icon: AlertCircle, label: "Kedaluwarsa", color: "text-gray-500", bgColor: "bg-gray-500/10" },
  };
  return configs[status as keyof typeof configs] || configs.pending;
};

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    qris: "QRIS",
    gopay: "GoPay",
    ovo: "OVO",
    dana: "DANA",
    shopeepay: "ShopeePay",
    linkaja: "LinkAja",
    bca: "BCA",
    mandiri: "Mandiri",
    bni: "BNI",
    bri: "BRI",
    cimb: "CIMB Niaga",
    permata: "Permata",
  };
  return labels[method] || method.toUpperCase();
};

export function TransactionDetailModal({ open, onOpenChange, transaction }: TransactionDetailModalProps) {
  if (!transaction) return null;

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detail Transaksi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <div className={`p-4 rounded-lg ${statusConfig.bgColor}`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Status Transaksi</p>
                <p className={`text-lg font-semibold ${statusConfig.color}`}>
                  {statusConfig.label}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                ID: {transaction.id.slice(0, 8)}
              </Badge>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Informasi Produk
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Game</p>
                <p className="font-medium">{transaction.games.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produk</p>
                <p className="font-medium">{transaction.products.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">ID Akun Game</p>
                <p className="font-medium font-mono text-sm">{transaction.user_game_id}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Total Harga</p>
                <p className="font-medium text-2xl text-primary">Rp {transaction.total_price.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Metode Pembayaran
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{getPaymentMethodLabel(transaction.payment_method)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {transaction.payment_method.includes('qris') && "Scan QR code untuk membayar"}
                {['gopay', 'ovo', 'dana', 'shopeepay', 'linkaja'].includes(transaction.payment_method) && "Pembayaran melalui e-wallet"}
                {['bca', 'mandiri', 'bni', 'bri', 'cimb', 'permata'].includes(transaction.payment_method) && "Transfer bank"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Points Earned */}
          {transaction.status === 'success' && transaction.points_earned > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Poin Loyalitas
                </h3>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Poin yang Didapat</p>
                      <p className="text-2xl font-bold text-primary">+{transaction.points_earned}</p>
                    </div>
                    <Trophy className="h-12 w-12 text-primary opacity-20" />
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Transaction Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Waktu Transaksi
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Dibuat pada</p>
              <p className="font-medium">
                {format(new Date(transaction.created_at), "dd MMMM yyyy, HH:mm:ss")}
              </p>
            </div>
          </div>

          {/* Help Text */}
          {transaction.status === 'pending' && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Menunggu Pembayaran:</strong> Silakan selesaikan pembayaran Anda sesuai instruksi yang diberikan.
              </p>
            </div>
          )}
          
          {transaction.status === 'failed' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Pembayaran Gagal:</strong> Transaksi ini tidak berhasil. Silakan coba lagi atau hubungi customer service.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
