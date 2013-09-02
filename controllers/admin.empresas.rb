require 'json'

get '/admin/empresas' do
  tome('admin/empresas')
end


route :get, :post, '/admin/empresas/add' do

  telefone_tipos = {
      1 => 'Celular',
      2 => 'Telefone',
      3 => 'Nextel(Não precisa de DDD)',
      4 => 'Fax'
  }


  if request.env["REQUEST_METHOD"] == 'POST' then
    keys_to_select = ['plano', 'estado', 'cidade', 'nome', 'endereco', 'descricao', 'cep', 'coordenadas', 'videos', 'telefones', 'logo']
    p = params.select do |k, v|
      if (k === 'videos')
        if not v.kind_of?(Array)
          return false
        end
      end
      if (k === 'telefones')
        if not v.kind_of?(Object)
          return false
        end
      end

      keys_to_select.include?(k)
    end

  end


    titulos = {}
    $db.collection('categories').find().each do |it|
      titulos[it['_id']] = it['title']
    end

    tome('admin/empresas/add', {:planos => {
        'plano1' => 'Plano 1',
        'plano2' => 'Plano 2',
    }, :titulos => titulos, :telefone_tipos => telefone_tipos})

end