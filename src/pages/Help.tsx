import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gradient mb-8 text-center animate-fade-in">Bantuan</h1>

        <Card className="glass border-border mb-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Bagaimana cara top-up?</AccordionTrigger>
                <AccordionContent>
                  1. Login ke akun Anda<br/>
                  2. Pilih game yang ingin di top-up<br/>
                  3. Masukkan User ID<br/>
                  4. Pilih paket dan metode pembayaran<br/>
                  5. Klik "Beli Sekarang"
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Apa itu Loyalty Vault?</AccordionTrigger>
                <AccordionContent>
                  Loyalty Vault adalah sistem poin reward. Setiap transaksi Rp 10.000 = 1 poin loyalty yang bisa ditukar voucher.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Berapa lama proses top-up?</AccordionTrigger>
                <AccordionContent>
                  Proses instant! Biasanya masuk dalam 1-5 menit setelah pembayaran berhasil.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}