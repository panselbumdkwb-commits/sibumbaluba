import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'

export default function KontakPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Send className="h-3 w-3" /> Hubungi Kami
        </div>
        <h1 className="text-3xl font-bold mb-2">Kontak</h1>
        <p className="text-muted-foreground max-w-xl">
          Untuk pertanyaan dan informasi lebih lanjut, silakan hubungi Bagian Perekonomian dan SDA Setda Kota Batu.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Info Kontak */}
        <div className="space-y-6">
          {[
            {
              icon: MapPin,
              label: 'Alamat Kantor',
              value: 'Bagian Perekonomian dan SDA\nSekretariat Daerah Kota Batu\nJl. Panglima Sudirman No. 507\nKota Batu, Jawa Timur 65311',
              color: 'text-red-500 bg-red-50 dark:bg-red-950/30',
            },
            {
              icon: Phone,
              label: 'Telepon',
              value: '(0341) 591024',
              color: 'text-green-600 bg-green-50 dark:bg-green-950/30',
            },
            {
              icon: Mail,
              label: 'Email',
              value: 'simbubalada@kotabatu.go.id',
              color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
            },
            {
              icon: Clock,
              label: 'Jam Layanan',
              value: 'Senin – Kamis: 08.00 – 16.00 WIB\nJumat: 08.00 – 15.00 WIB\nSabtu – Minggu: Tutup',
              color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30',
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium text-foreground whitespace-pre-line leading-relaxed">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form Pesan */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Kirim Pesan</h2>
          <form className="space-y-4" onSubmit={(e: React.FormEvent) => e.preventDefault()}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama Lengkap</label>
                <input type="text" placeholder="Nama Anda"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email / No. HP</label>
                <input type="text" placeholder="email@contoh.com"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Instansi / Organisasi</label>
              <input type="text" placeholder="Nama instansi (opsional)"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Perihal</label>
              <input type="text" placeholder="Perihal pesan"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Isi Pesan</label>
              <textarea placeholder="Tuliskan pesan Anda di sini..." rows={5}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <button type="submit"
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm">
              <Send className="h-4 w-4" />
              Kirim Pesan
            </button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Pesan akan direspons pada hari kerja berikutnya.
          </p>
        </div>
      </div>

      {/* Peta */}
      <div className="mt-10 rounded-2xl overflow-hidden border border-border h-72 bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Peta Lokasi</p>
          <p className="text-xs mt-1">Sekretariat Daerah Kota Batu, Jl. Panglima Sudirman No. 507</p>
          <a
            href="https://maps.google.com/?q=Kantor+Walikota+Batu+Jawa+Timur"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            Buka di Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}
