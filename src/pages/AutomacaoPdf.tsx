import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner@2.0.3';
import { FileDown, Bold, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import jsPDF from 'jspdf';
import { motion } from 'motion/react';

export default function AutomacaoPdf() {
  const [pdfData, setPdfData] = useState({
    cliente: '',
    descricao: '',
    valor: '',
    responsavel: '',
    alignment: 'left' as 'left' | 'center' | 'right',
    fontSize: '12',
    fontColor: '#000000',
    useBold: false,
  });

  const [previewKey, setPreviewKey] = useState(0);

  const handleExportPDF = () => {
    if (!pdfData.cliente || !pdfData.descricao || !pdfData.valor || !pdfData.responsavel) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const doc = new jsPDF();

    // Set font style
    if (pdfData.useBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    // Header - Fixed
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('ORÇAMENTO DE SERVIÇOS', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Empresa XYZ Construções Ltda', 105, 30, { align: 'center' });
    doc.text('CNPJ: 12.345.678/0001-90', 105, 35, { align: 'center' });
    doc.text('Tel: (11) 1234-5678 | Email: contato@empresaxyz.com', 105, 40, { align: 'center' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    // Editable fields
    const fontSize = parseInt(pdfData.fontSize);
    doc.setFontSize(fontSize);
    
    // Parse color
    const color = pdfData.fontColor;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    doc.setTextColor(r, g, b);

    let yPos = 60;

    // Cliente
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE:', 20, yPos);
    doc.setFont('helvetica', pdfData.useBold ? 'bold' : 'normal');
    doc.text(pdfData.cliente, 45, yPos);
    yPos += 15;

    // Descrição
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DESCRIÇÃO DO SERVIÇO:', 20, yPos);
    yPos += 8;

    doc.setFont('helvetica', pdfData.useBold ? 'bold' : 'normal');
    doc.setTextColor(r, g, b);
    const descLines = doc.splitTextToSize(pdfData.descricao, 170);
    descLines.forEach((line: string) => {
      const xPos = pdfData.alignment === 'center' ? 105 : pdfData.alignment === 'right' ? 190 : 20;
      const align = pdfData.alignment;
      doc.text(line, xPos, yPos, { align });
      yPos += 6;
    });

    yPos += 10;

    // Valor
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('VALOR DO ORÇAMENTO:', 20, yPos);
    doc.setFont('helvetica', pdfData.useBold ? 'bold' : 'normal');
    doc.setTextColor(r, g, b);
    doc.setFontSize(fontSize + 2);
    doc.text(`R$ ${parseFloat(pdfData.valor).toFixed(2)}`, 90, yPos);
    yPos += 15;

    // Responsável
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('RESPONSÁVEL TÉCNICO:', 20, yPos);
    doc.setFont('helvetica', pdfData.useBold ? 'bold' : 'normal');
    doc.setTextColor(r, g, b);
    doc.text(pdfData.responsavel, 80, yPos);

    // Footer - Fixed
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.line(20, 260, 190, 260);
    doc.text('Este orçamento tem validade de 30 dias a partir da data de emissão.', 105, 270, {
      align: 'center',
    });
    doc.text(
      `Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`,
      105,
      280,
      { align: 'center' }
    );

    doc.save('orcamento.pdf');
    toast.success('PDF exportado com sucesso!');
  };

  const updatePreview = () => {
    setPreviewKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Automação de PDF</h1>
        <p className="text-gray-600">Gere orçamentos personalizados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Nome do Cliente *</Label>
                <Input
                  value={pdfData.cliente}
                  onChange={(e) => {
                    setPdfData({ ...pdfData, cliente: e.target.value });
                    updatePreview();
                  }}
                  placeholder="Digite o nome do cliente"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição do Serviço *</Label>
                <Textarea
                  value={pdfData.descricao}
                  onChange={(e) => {
                    setPdfData({ ...pdfData, descricao: e.target.value });
                    updatePreview();
                  }}
                  placeholder="Descreva o serviço a ser realizado"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pdfData.valor}
                  onChange={(e) => {
                    setPdfData({ ...pdfData, valor: e.target.value });
                    updatePreview();
                  }}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label>Responsável Técnico *</Label>
                <Input
                  value={pdfData.responsavel}
                  onChange={(e) => {
                    setPdfData({ ...pdfData, responsavel: e.target.value });
                    updatePreview();
                  }}
                  placeholder="Nome do responsável"
                />
              </div>

              {/* Formatting Options */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="text-gray-900">Formatação</h3>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={pdfData.useBold ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setPdfData({ ...pdfData, useBold: !pdfData.useBold });
                      updatePreview();
                    }}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant={pdfData.alignment === 'left' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setPdfData({ ...pdfData, alignment: 'left' });
                      updatePreview();
                    }}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant={pdfData.alignment === 'center' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setPdfData({ ...pdfData, alignment: 'center' });
                      updatePreview();
                    }}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant={pdfData.alignment === 'right' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setPdfData({ ...pdfData, alignment: 'right' });
                      updatePreview();
                    }}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tamanho da Fonte</Label>
                    <Select
                      value={pdfData.fontSize}
                      onValueChange={(value) => {
                        setPdfData({ ...pdfData, fontSize: value });
                        updatePreview();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10pt</SelectItem>
                        <SelectItem value="12">12pt</SelectItem>
                        <SelectItem value="14">14pt</SelectItem>
                        <SelectItem value="16">16pt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={pdfData.fontColor}
                        onChange={(e) => {
                          setPdfData({ ...pdfData, fontColor: e.target.value });
                          updatePreview();
                        }}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={pdfData.fontColor}
                        onChange={(e) => {
                          setPdfData({ ...pdfData, fontColor: e.target.value });
                          updatePreview();
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleExportPDF} className="w-full">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-gray-900">Preview</h3>
                <div
                  key={previewKey}
                  className="border-2 border-gray-200 rounded-lg p-6 bg-white min-h-[600px]"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {/* Fixed Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-gray-900 mb-2">ORÇAMENTO DE SERVIÇOS</h2>
                    <p className="text-gray-700 text-xs">Empresa XYZ Construções Ltda</p>
                    <p className="text-gray-600 text-xs">CNPJ: 12.345.678/0001-90</p>
                    <p className="text-gray-600 text-xs">
                      Tel: (11) 1234-5678 | Email: contato@empresaxyz.com
                    </p>
                  </div>

                  <hr className="my-4 border-gray-300" />

                  {/* Editable Content */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-900">CLIENTE: </span>
                      <span
                        style={{
                          color: pdfData.fontColor,
                          fontWeight: pdfData.useBold ? 'bold' : 'normal',
                          fontSize: `${pdfData.fontSize}px`,
                        }}
                      >
                        {pdfData.cliente || '[Nome do cliente]'}
                      </span>
                    </div>

                    <div>
                      <p className="text-gray-900 mb-2">DESCRIÇÃO DO SERVIÇO:</p>
                      <p
                        style={{
                          color: pdfData.fontColor,
                          fontWeight: pdfData.useBold ? 'bold' : 'normal',
                          fontSize: `${pdfData.fontSize}px`,
                          textAlign: pdfData.alignment,
                        }}
                      >
                        {pdfData.descricao || '[Descrição do serviço]'}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-900">VALOR DO ORÇAMENTO: </span>
                      <span
                        style={{
                          color: pdfData.fontColor,
                          fontWeight: pdfData.useBold ? 'bold' : 'normal',
                          fontSize: `${parseInt(pdfData.fontSize) + 2}px`,
                        }}
                      >
                        R$ {pdfData.valor ? parseFloat(pdfData.valor).toFixed(2) : '0,00'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-900">RESPONSÁVEL TÉCNICO: </span>
                      <span
                        style={{
                          color: pdfData.fontColor,
                          fontWeight: pdfData.useBold ? 'bold' : 'normal',
                          fontSize: `${pdfData.fontSize}px`,
                        }}
                      >
                        {pdfData.responsavel || '[Nome do responsável]'}
                      </span>
                    </div>
                  </div>

                  {/* Fixed Footer */}
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <hr className="my-4 border-gray-300" />
                    <p className="text-gray-600 text-xs">
                      Este orçamento tem validade de 30 dias a partir da data de emissão.
                    </p>
                    <p className="text-gray-600 text-xs mt-2">
                      Data de emissão: {new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
