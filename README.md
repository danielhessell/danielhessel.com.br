# danielhessel.com.br

Site pessoal de [Daniel Hessel](https://www.linkedin.com/in/danielhessell/).

- `/` redireciona direto pro meu LinkedIn.
- [`/tools`](https://danielhessel.com.br/tools) é uma coleção de utilitários que uso no dia a dia como dev — a parte visível do site.

Disponível em português, inglês e espanhol (detecção automática pelo navegador, com seletor manual).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4
- [next-intl](https://next-intl.dev) para i18n
- Deploy na [Vercel](https://vercel.com)

## Ferramentas

Praticamente todas 100% client-side — nada sai do navegador:

- Contador de caracteres/palavras/linhas
- Formatador de JSON, XML e CSV/YAML ↔ JSON
- Visualizador de Markdown
- Codificar/decodificar Base64, Hex e URL
- Conversor de caixa (upper/lower/camelCase/snake_case/...)
- Gerador de timestamp (Unix, ISO 8601, Java, Node, Python) e UUID v4
- Decodificador de JWT
- Gerador de hash (MD5/SHA-1/SHA-256)
- Comparador de diferenças (até 6 arquivos, modo unificado ou lado a lado)
- **Verificador de certificado digital** — a única exceção à regra client-side, detalhada abaixo

## Verificador de certificado

Cola ou envia um certificado (PEM, DER ou PFX/PKCS#12 com senha) e recebe validade, emissor, nomes alternativos (SANs), fingerprints, uso de chave e, mais importante, **status de revogação**.

### Por que essa ferramenta é diferente

Todas as outras ferramentas do site rodam inteiramente no navegador. Essa não — e a página avisa isso explicitamente. O motivo é que checar se um certificado foi revogado exige perguntar pra própria autoridade certificadora (CA), o que só dá pra fazer com uma requisição de servidor. O certificado em si não é informação sensível (é público por natureza, transmitido em todo handshake TLS), mas vale deixar claro que o fluxo é diferente do resto do site.

### Como a revogação é verificada

Duas fontes de verdade, com um seletor de modo na própria ferramenta:

- **OCSP** — busca o certificado do emissor via URL "CA Issuers" da extensão AIA do certificado (com fallback pra decodificar PKCS#7, formato comum em CAs governamentais/corporativas como as da ICP-Brasil), monta uma requisição OCSP e envia pro respondedor da CA.
- **CRL** — extrai a URL de distribuição de CRL do próprio certificado, baixa a lista de revogação completa e verifica se o número de série consta nela. CRLs de CAs grandes ou nacionais podem ter dezenas de milhares de entradas (um caso real de produção tinha ~40 mil) — o parser ASN.1 usado por padrão tem um limite de segurança contra DoS baixo demais pra isso, então o parsing é feito com um limite bem mais generoso.
- **Modo automático** (padrão): tenta OCSP primeiro, cai pro CRL só se o OCSP não resolver. Também dá pra forçar só OCSP ou só CRL.

Quando o certificado está revogado, aparece um banner em destaque no topo do resultado, além dos detalhes na seção de revogação.

### Segurança

As buscas de rede (emissor via AIA, resposta OCSP, arquivo CRL) partem de URLs embutidas nos dados do próprio certificado — não de input direto do usuário, mas ainda assim não confiável. Toda requisição passa por um `safeFetch` com proteção contra SSRF: só `http(s)`, bloqueia IPs privados/loopback/link-local (IPv4 e IPv6, incluindo formas IPv4-mapeadas), timeout curto, no máximo um redirect revalidado, e limite de tamanho de resposta.

### Limitações conhecidas

- Não verifica a assinatura criptográfica da resposta OCSP nem do CRL (confia no canal, não valida a prova).
- De um arquivo PFX/PKCS#12, extrai só o primeiro certificado encontrado (não monta a cadeia completa).
- Rebind de DNS pra IP privado não é bloqueado (só IPs literais são checados).

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Estrutura

```
src/
  app/
    page.tsx                  # "/" — redirect pro LinkedIn
    tools/<slug>/page.tsx      # cada ferramenta
    api/certificate-check/     # única API route do site
  components/                  # componentes compartilhados (Panel, Button, etc)
  lib/
    formatters/                 # lógica pura de cada ferramenta (client-safe)
    server/                     # lógica do certificate checker (safeFetch, ocsp, crl, pkcs7...)
  i18n/                         # config do next-intl
messages/{pt-BR,en,es}.json     # traduções
```

## Deploy

Hospedado na Vercel. Domínio customizado configurado direto no dashboard da Vercel (DNS via registro.br), não no código.
