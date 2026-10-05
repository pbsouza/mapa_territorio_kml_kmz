import { parseKmlContent } from '../utils/kmzParser';
import { KmlDocument } from '../types/kml';

export interface SampleDataset {
  id: string;
  name: string;
  subtitle: string;
  location: string;
  count: number;
  kmlRaw: string;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro - Roteiro Completo',
    subtitle: 'Praias, Mirantes Panorâmicos, Cultura & Gastronomia',
    location: 'Rio de Janeiro, RJ',
    count: 8,
    kmlRaw: `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Rio de Janeiro - Roteiro Turístico</name>
    <description>Pontos turísticos icônicos, mirantes espetaculares e praias do Rio de Janeiro.</description>
    
    <Folder>
      <name>Mirantes &amp; Monumentos</name>
      <Placemark>
        <name>Cristo Redentor &amp; Corcovado</name>
        <description><![CDATA[
          <div style="font-family: sans-serif; line-height: 1.5;">
            <p><strong>Uma das Sete Maravilhas do Mundo Moderno.</strong></p>
            <p>Monumento em estilo Art Déco situado a 710 metros acima do nível do mar no Parque Nacional da Tijuca, oferecendo visão panorâmica de 360° da Baía de Guanabara, praias e Zona Sul.</p>
            <p><em>Dica:</em> Chegue cedo pelo Trem do Corcovado para evitar filas.</p>
          </div>
        ]]></description>
        <Point>
          <coordinates>-43.210487,-22.951916,710</coordinates>
        </Point>
      </Placemark>
      
      <Placemark>
        <name>Pão de Açúcar &amp; Bondinho</name>
        <description><![CDATA[
          <div style="font-family: sans-serif; line-height: 1.5;">
            <p>Complexo de morros na entrada da Baía de Guanabara interligados por teleférico envidraçado desde 1912.</p>
            <p>Famoso pelo pôr do sol cinematográfico e vista para a Enseada de Botafogo e Copacabana.</p>
          </div>
        ]]></description>
        <Point>
          <coordinates>-43.157143,-22.949216,396</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Mirante Dona Marta</name>
        <description><![CDATA[
          <p>Localizado a 360m de altitude, proporciona uma das vistas mais frontais do Cristo Redentor e do Pão de Açúcar. Acesso gratuito de carro ou van turística.</p>
        ]]></description>
        <Point>
          <coordinates>-43.196324,-22.945281,360</coordinates>
        </Point>
      </Placemark>
    </Folder>

    <Folder>
      <name>Praias Famosas</name>
      <Placemark>
        <name>Praia de Copacabana (Posto 4)</name>
        <description><![CDATA[
          <p>O calçadão mais famoso do planeta desenhado por Burle Marx, com quiosques animados, água de coco gelada e areia dourada.</p>
        ]]></description>
        <Point>
          <coordinates>-43.182285,-22.970722,0</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Praia de Ipanema &amp; Pedra do Arpoador</name>
        <description><![CDATA[
          <p>Palco cultural e berço da Bossa Nova. A Pedra do Arpoador é tradição carioca para aplaudir o sol se pondo no mar.</p>
        ]]></description>
        <Point>
          <coordinates>-43.191147,-22.987747,0</coordinates>
        </Point>
      </Placemark>
    </Folder>

    <Folder>
      <name>Cultura &amp; Arquitetura</name>
      <Placemark>
        <name>Museu do Amanhã &amp; Porto Maravilha</name>
        <description><![CDATA[
          <p>Museu de ciências aplicadas projetado pelo arquiteto espanhol Santiago Calatrava na Praça Mauá. Explora o futuro da humanidade, sustentabilidade e inovação.</p>
        ]]></description>
        <Point>
          <coordinates>-43.181347,-22.894392,0</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Escadaria Selarón &amp; Lapa</name>
        <description><![CDATA[
          <p>Obra de arte urbana ao ar livre com mais de 2.000 azulejos de mais de 60 países, criada pelo artista chileno Jorge Selarón entre Santa Teresa e Lapa.</p>
        ]]></description>
        <Point>
          <coordinates>-43.179379,-22.915444,0</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Jardim Botânico do Rio de Janeiro</name>
        <description><![CDATA[
          <p>Fundado em 1808 por D. João VI, abriga mais de 6.500 espécies de flora brasileira e estrangeira, com a lendária aléia de palmeiras-imperiais.</p>
        ]]></description>
        <Point>
          <coordinates>-43.224151,-22.966779,0</coordinates>
        </Point>
      </Placemark>
    </Folder>

    <Folder>
      <name>Trilhas &amp; Rotas</name>
      <Placemark>
        <name>Trilha da Pedra Bonita</name>
        <description><![CDATA[
          <p>Trilha de nível fácil a moderado (cerca de 35 minutos de subida) que oferece uma visão espetacular da Pedra da Gávea e da orla de São Conrado.</p>
        ]]></description>
        <LineString>
          <coordinates>
            -43.277819,-22.985923,0
            -43.278522,-22.984218,100
            -43.279893,-22.983151,350
            -43.281132,-22.982245,690
          </coordinates>
        </LineString>
      </Placemark>
    </Folder>
  </Document>
</kml>`,
  },
  {
    id: 'sao-paulo',
    name: 'São Paulo - Parques e Espaços Culturais',
    subtitle: 'Parque Ibirapuera, MASP, Beco do Batman e Gastronomia',
    location: 'São Paulo, SP',
    count: 7,
    kmlRaw: `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>São Paulo - Roteiro Urbano</name>
    <description>Pontos de interesse cultural, áreas verdes e polos gastronômicos da capital paulista.</description>
    
    <Folder>
      <name>Parques &amp; Natureza</name>
      <Placemark>
        <name>Parque Ibirapuera (Portão 3)</name>
        <description><![CDATA[
          <p>O coração verde de São Paulo, projetado paisagisticamente por Roberto Burle Marx com pavilhões de Oscar Niemeyer (MAM, Bienal e Oca).</p>
        ]]></description>
        <Point>
          <coordinates>-46.657634,-23.587416,0</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Parque Villa-Lobos</name>
        <description><![CDATA[
          <p>Excelente parque plano na Zona Oeste com pistas de patins e bike, orquidário e Biblioteca Villa-Lobos.</p>
        ]]></description>
        <Point>
          <coordinates>-46.723145,-23.548321,0</coordinates>
        </Point>
      </Placemark>
    </Folder>

    <Folder>
      <name>Museus &amp; Arte</name>
      <Placemark>
        <name>MASP - Museu de Arte de São Paulo</name>
        <description><![CDATA[
          <p>Ícone arquitetônico de Lina Bo Bardi na Avenida Paulista com seu vão livre de 74 metros e cavaletes de cristal.</p>
        ]]></description>
        <Point>
          <coordinates>-46.655881,-23.561414,0</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Pinacoteca de São Paulo</name>
        <description><![CDATA[
          <p>Museu de artes visuais mais antigo de SP, instalado no edifício de Ramos de Azevedo junto ao Parque da Luz.</p>
        ]]></description>
        <Point>
          <coordinates>-46.634125,-23.534241,0</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Beco do Batman (Vila Madalena)</name>
        <description><![CDATA[
          <p>Galeria a céu aberto de grafite urbano, cercada de bistrôs, ateliês e bares boêmios.</p>
        ]]></description>
        <Point>
          <coordinates>-46.686523,-23.556214,0</coordinates>
        </Point>
      </Placemark>
    </Folder>

    <Folder>
      <name>Gastronomia &amp; Comércio</name>
      <Placemark>
        <name>Mercado Municipal Paulistano (Mercadão)</name>
        <description><![CDATA[
          <p>Construído nos anos 1930 com vitrais alemães, famoso pelas frutas exóticas e pelo clássico sanduíche de mortadela e pastel de bacalhau.</p>
        ]]></description>
        <Point>
          <coordinates>-46.629342,-23.541912,0</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Bairro da Liberdade (Praça da Liberdade)</name>
        <description><![CDATA[
          <p>Maior reduto da comunidade japonesa fora do Japão, com luminárias orientais suzuran-tō, feiras de rua e restaurantes asiáticos.</p>
        ]]></description>
        <Point>
          <coordinates>-46.634912,-23.555231,0</coordinates>
        </Point>
      </Placemark>
    </Folder>
  </Document>
</kml>`,
  },
  {
    id: 'chapada-veadeiros',
    name: 'Chapada dos Veadeiros - Ecoturismo & Trilhas',
    subtitle: 'Cachoeiras, Cânions, Mirantes e Trilhas no Cerrado',
    location: 'Alto Paraíso & São Jorge, GO',
    count: 6,
    kmlRaw: `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Chapada dos Veadeiros - Trilhas &amp; Cachoeiras</name>
    <description>Patrimônio Mundial Natural da UNESCO no coração do Planalto Central brasileiro.</description>
    
    <Folder>
      <name>Cachoeiras &amp; Poços</name>
      <Placemark>
        <name>Cataratas dos Couros</name>
        <description><![CDATA[
          <p>Conjunto monumental de quedas e corredeiras do Rio dos Couros com piscinas naturais de águas esmeralda.</p>
        ]]></description>
        <Point>
          <coordinates>-47.747124,-14.288214,0</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Cachoeira Santa Bárbara (Cavalcante)</name>
        <description><![CDATA[
          <p>Famosa pela água incrivelmente azul-turquesa cristalina, localizada no território Quilombola Kalunga.</p>
        ]]></description>
        <Point>
          <coordinates>-47.514213,-13.791542,0</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Cachoeira Almécegas I &amp; II</name>
        <description><![CDATA[
          <p>Queda de 45 metros em paredão de arenito roxo com mirante e lago amplo para banho na Fazenda São Bento.</p>
        ]]></description>
        <Point>
          <coordinates>-47.591241,-14.167812,0</coordinates>
        </Point>
      </Placemark>
    </Folder>

    <Folder>
      <name>Parque Nacional</name>
      <Placemark>
        <name>Centro de Visitantes do Parque Nacional</name>
        <description><![CDATA[
          <p>Portão de entrada oficial em São Jorge para as trilhas dos Cânions, Saltos do Rio Preto e Carrossel.</p>
        ]]></description>
        <Point>
          <coordinates>-47.818912,-14.170241,0</coordinates>
        </Point>
      </Placemark>

      <Placemark>
        <name>Trilha dos Saltos do Rio Preto (120m e 80m)</name>
        <description><![CDATA[
          <p>Trilha clássica do Parque Nacional com passagem pelo Salto de 120m e banho no Poço do Salto de 80m.</p>
        ]]></description>
        <LineString>
          <coordinates>
            -47.818912,-14.170241,0
            -47.824125,-14.164312,0
            -47.831201,-14.159418,0
            -47.839812,-14.154215,0
          </coordinates>
        </LineString>
      </Placemark>

      <Placemark>
        <name>Vale da Lua</name>
        <description><![CDATA[
          <p>Formações rochosas esculpidas pelas corredeiras do Rio São Miguel lembrando a superfície lunar, com caldeirões e grutas subaquáticas.</p>
        ]]></description>
        <Point>
          <coordinates>-47.788412,-14.184312,0</coordinates>
        </Point>
      </Placemark>
    </Folder>
  </Document>
</kml>`,
  },
];

export function getSampleDataset(id: string): KmlDocument {
  const sample = SAMPLE_DATASETS.find((s) => s.id === id) || SAMPLE_DATASETS[0];
  return parseKmlContent(sample.kmlRaw, `${sample.id}.kml`, sample.kmlRaw.length);
}
