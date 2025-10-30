import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { LogOut, Edit2, Camera, Upload } from 'lucide-react';
import { motion } from 'motion/react';

export default function MinhaConta() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ nome: formData.nome });
    toast.success('Nome atualizado com sucesso!');
    setIsEditDialogOpen(false);
  };

  const handleUpdateAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ avatar_url: avatarUrl });
    toast.success('Foto atualizada com sucesso!');
    setIsAvatarDialogOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingImage(true);

    // Convert to base64 for local storage (in production, upload to Supabase Storage)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarUrl(base64String);
      updateUser({ avatar_url: base64String });
      setUploadingImage(false);
      toast.success('Foto atualizada com sucesso!');
    };
    reader.onerror = () => {
      setUploadingImage(false);
      toast.error('Erro ao carregar a imagem');
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-gray-900">Minha Conta</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-4xl">{user.nome.charAt(0)}</AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Clique no ícone para selecionar uma foto<br />
                (Máximo 5MB)
              </p>
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-600">Nome</p>
                  <p className="text-gray-900">{user.nome}</p>
                </div>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Nome</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateName} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome de Exibição</Label>
                        <Input
                          value={formData.nome}
                          onChange={(e) => setFormData({ nome: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Salvar Alterações
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">Permissão</p>
                <Badge variant={user.permissao === 'admin' ? 'default' : 'secondary'}>
                  {user.permissao === 'admin' ? 'Administrador' : 'Visualizador'}
                </Badge>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="text-blue-900 mb-2">Sobre as Permissões</h3>
            <div className="text-blue-800 space-y-1 text-xs">
              <p>
                <strong>Administrador:</strong> Acesso completo ao sistema, pode criar, editar e
                excluir dados.
              </p>
              <p>
                <strong>Visualizador:</strong> Pode visualizar todos os dados, mas não pode fazer
                alterações.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
