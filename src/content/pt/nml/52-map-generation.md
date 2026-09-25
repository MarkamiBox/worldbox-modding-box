---
title: Geração de mapa
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbworld:
order: 169
---

# Geração de mapa :wbworld:

A janela de novo mundo lê três bibliotecas. `map_sizes` é o seletor de tamanho, `map_gen_templates` é a fileira de cartas de formato (`continent`, `islands`, `donut`...), e `map_gen_settings` são os controles deslizantes e interruptores que você recebe depois de escolher uma carta. As três são bibliotecas de asset comuns. Só uma delas é plug and play, e eu vou dizer quais partes exigem trabalho de UI antes que você descubra do jeito difícil.

## Um mapa maior

Um tamanho é um `MapSizeAsset`, e são quatro campos:

| Campo | O que faz |
| --- | --- |
| `id` | Também a chave de tradução, com um prefixo: `map_size_<id>` |
| `size` | O lado do mapa em blocos de 64 tiles. `iceberg` é `9`, então 576 x 576 |
| `path_icon` | O ícone ao lado do nome do tamanho, relativo a `ui/Icons/` |
| `show_warning` | Troca a saudação da janela pelo aviso de "este mapa é grande" |

Os vanilla: `tiny` 2 · `small` 3 · `standard` 4 · `large` 5 · `huge` 6 · `gigantic` 7 · `titanic` 8 · `iceberg` 9.

```csharp Mods/HelloBox/Code/HelloMapGen.cs
namespace HelloBox
{
    public static class HelloMapGen
    {
        public const string COLOSSAL = "hello_colossal";

        public static void Initialize()
        {
            AddColossal();
            AddRing();
        }

        public const string RING = "hello_ring";

        private static void AddRing()
        {
            if (AssetManager.map_gen_templates.has(RING)) return;

            MapGenTemplate ring = AssetManager.map_gen_templates.clone(RING, "donut");

            // values é um objeto simples, então o clone compartilha o do donut. dê o seu próprio antes de mexer
            ring.values = new MapGenValues
            {
                gradient_round_edges = true,
                add_center_gradient_land = true,
                add_center_lake = true,
                ring_effect = true,
                perlin_noise_stage_2 = true,
                random_shapes_amount = 3
            };

            // reset copia de uma tabela de backup preenchida na inicialização, e seu id não está nela
            ring.show_reset_button = false;
        }

        public static void OpenRing()
        {
            if (!AssetManager.map_gen_templates.has(RING)) return;

            Config.current_map_template = RING;
            ScrollWindow.showWindow("new_world_templates_2");
        }

        private static void AddColossal()
        {
            if (AssetManager.map_sizes.has(COLOSSAL)) return;

            AssetManager.map_sizes.add(new MapSizeAsset
            {
                id = COLOSSAL,
                size = 10,                   // 10 x 64 = 640 tiles de lado
                path_icon = "iconIceberg",   // ui/Icons/ é adicionado para você
                show_warning = true
            });

            // o seletor de tamanho lê um array construído em linkAssets(), que rodou antes do seu mod
            AssetManager.map_sizes.linkAssets();
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "map_size_hello_colossal": "Colossal"
}
```

> [!WARNING] Sem `linkAssets()` o tamanho fica inacessível
> As setas na janela não percorrem a biblioteca. Elas percorrem um `string[]` simples que `MapSizeLibrary.linkAssets()` constrói uma vez na inicialização, antes do NML carregar você. Seu tamanho está registrado, e as setas passam direto por ele para sempre. Chamar `linkAssets()` de novo só reconstrói esse array, então é seguro.

As setas seguem a ordem de `list`, então um tamanho adicionado no fim aparece depois de `iceberg`, que é onde um mapa maior pertence. Um menor quer `list.Remove` e `list.Insert(0, ...)` antes da chamada de `linkAssets()`.

O que eu posso te dizer sobre os limites, a partir do código:

- **O upload para o Workshop recusa.** O upload compara o tamanho com `Config.maxMapSize`, que é `iceberg`, e rejeita qualquer coisa maior com "Not a valid world size!".
- **Sem o seu mod, a lista de saves mostra números crus.** O navegador de saves procura o tamanho pelo número e cai para "largura x altura" quando nada bate. Se um save assim carrega direito sem o seu mod, eu não testei.
- **Eu não testei até onde isso vai.** `10` é 23% mais tiles que `iceberg`, e cada passo depois disso custa mais. Em algum ponto lá em cima existe um número que o computador dos seus jogadores não vai gostar :PES5_Hmmmm:.

## Um novo formato de mundo

Um template é um `MapGenTemplate`. A receita de verdade vive em seu `values`, o resto decide como ele é apresentado:

| Campo | O que faz |
| --- | --- |
| `values` | Um `MapGenValues`: os flags e números que o gerador lê. Veja abaixo |
| `path_icon` | A imagem de pré-visualização, caminho completo: `ui/new_world_templates_icons/template_donut` |
| `force_height_to` | Define a altura de todo tile depois da primeira passagem de ruído, antes do resto moldar o formato. `0` pula essa etapa |
| `freeze_mountains` | Congela os topos das montanhas assim que a terra estiver pronta |
| `perlin_replace` | Trocas de tile baseadas em altura, tipo "acima de 170, `soil_high` vira `soil_low`" |
| `special_anthill`, `special_checkerboard`, `special_cubicles` | Ativa um dos três geradores fixos no código |
| `allow_edit_*` | Quais linhas de configuração o jogador vê para este template. Veja a próxima seção |
| `show_reset_button` | Se a janela tem um botão de "resetar" |

Os ids vanilla, todos fontes válidas para `clone()`: `continent` · `box_world` · `islands` · `toast` · `pancake` · `boring_plains` · `checkerboard` · `cubicles` · `dormant_volcano` · `cheese` · `bad_apple` · `donut` · `lasagna` · `chaos_pearl` · `anthill` · `empty`.

E os campos de `MapGenValues` que vale conhecer:

| Campo | O que faz |
| --- | --- |
| `main_perlin_noise_stage`, `perlin_noise_stage_2`, `perlin_noise_stage_3` | As três passagens de ruído que fazem a terra |
| `perlin_scale_stage_1` / `_2` / `_3` | O quanto cada passagem está ampliada. `5` por padrão |
| `gradient_round_edges` / `square_edges` | Diminui a altura em direção à borda do mapa, num círculo ou num quadrado |
| `add_center_gradient_land`, `add_center_lake`, `center_gradient_mountains` | Empurra terra, um lago ou montanhas em direção ao centro |
| `ring_effect` | Uma passagem extra de ruído em formato de anel |
| `add_mountain_edges` / `remove_mountains` | Uma borda de montanhas ao redor do mapa / achata montanhas até virarem chão normal |
| `low_ground` / `high_ground` | Baixa ou eleva o chão depois das passagens de ruído |
| `random_shapes_amount` | Quantos blobs aleatórios são carimbados por cima |
| `random_biomes`, `add_vegetation`, `add_resources` | Os três últimos são `true` por padrão |

O `AddRing()` acima clona um template vanilla e dá a ele sua própria receita. Mantenha os três métodos na mesma classe `HelloMapGen`.

```json Mods/HelloBox/Locales/en.json
{
  "template_hello_ring": "Ember Ring",
  "template_hello_ring_info": "A lake in the middle, land around it, and nobody asked for it."
}
```

> [!WARNING] Esconda o botão de reset nos seus próprios templates
> "Reset" chama `resetTemplateValues()`, que lê os padrões do template de um dicionário preenchido uma vez na inicialização com os ids vanilla. O seu não está nele, então o botão lança `KeyNotFoundException`. `show_reset_button = false` e o problema deixa de existir.

> [!WARNING] Um template clonado compartilha seu `values`
> `clone()` copia listas em novas listas, mas `values` é uma classe simples, então é copiado por referência (veja **[Bibliotecas de assets](#/nml/asset-libraries)**). Editar `ring.values.ring_effect` sem a linha `new MapGenValues` muda todo donut vanilla junto. As entradas dentro de `perlin_replace` são compartilhadas do mesmo jeito: construa novas em vez de editá-las.

### A pegadinha: não existe carta

O seletor de templates é um prefab. Ele tem um botão por template vanilla, e cada botão encontra seu template pelo próprio nome do GameObject. Um template novo não ganha botão, e nada na biblioteca muda isso.

O que funciona é fazer o trabalho do botão você mesmo: definir o template, depois abrir a segunda janela, exatamente como uma carta vanilla faz.

Chame `HelloMapGen.OpenRing()` a partir do seu botão.

Ligue isso a um botão simples, veja **[Abas e botões de poder](#/nml/power-buttons)**, e o jogador recebe sua pré-visualização, suas linhas de configuração, as setas de tamanho e o botão de gerar, como qualquer template vanilla. Colocar uma carta de verdade no seletor significa clonar um dos botões dele e renomear o clone antes do `Awake()` rodar, porque é aí que ele lê o próprio nome. Isso é cirurgia de UI que eu não verifiquei, então não está nesta página.

> [!NOTE] Editando um template vanilla em vez disso
> `AssetManager.map_gen_templates.get("islands").values.random_shapes_amount = 10;` funciona, e não precisa de botão nenhum. Só saiba que "reset" restaura a cópia da inicialização, que foi tirada antes do seu mod carregar. Um clique e sua mudança some até o próximo reinício.

## As linhas embaixo de um template

Cada controle deslizante e interruptor na segunda janela é um `MapGenSettingsAsset`:

| Campo | O que faz |
| --- | --- |
| `is_switch` | Liga/desliga em vez de um número |
| `min_value` / `max_value` | O intervalo, para um número |
| `allowed_check` | Dado o template atual, se esta linha é mostrada |
| `action_get` / `action_set` | Lê e escreve o valor, geralmente no `values` do template atual |
| `increase` / `decrease` / `action_switch` | O que as setas e o interruptor fazem |

As linhas vanilla: `gen_perlin_scale_stage_1` · `gen_perlin_scale_stage_2` · `gen_perlin_scale_stage_3` · `gen_random_shapes` · `gen_cubicles_sizes` · `gen_random_biomes` · `gen_mountain_edges` · `gen_add_vegetation` · `gen_add_resources` · `gen_add_center_lake` · `gen_add_center_land` · `gen_round_edges` · `gen_square_edges` · `gen_ring_effect` · `gen_low_ground` · `gen_high_ground` · `gen_remove_mountains` · `gen_forbidden_knowledge`.

A parte que um mod realmente usa: o `allowed_check` de cada linha vanilla lê um dos flags `allow_edit_*` do seu template. Então você não adiciona linhas, você escolhe quais dessas o jogador recebe:

```csharp
// em AddRing(), depois do clone: esconde tudo, depois devolve as linhas que fazem sentido para um anel
AssetManager.map_gen_templates.disableNormalSettings(ring);
ring.allow_edit_random_biomes = true;
ring.allow_edit_random_vegetation = true;
```

Detalhe curioso: os três controles deslizantes de perlin verificam `allow_edit_perlin_scale_stage_1`. Os flags `_2` e `_3` existem e nada os lê :PES2_Shrug:.

Um `MapGenSettingsAsset` novo, sozinho, não mostra nada. As linhas estão embutidas no prefab da janela e encontram seu asset pelo nome do GameObject, o mesmo truque das cartas de template. Uma linha sua significa clonar uma existente dentro da janela, e o que você registrar precisa ter `allowed_check` definido, porque a janela chama isso em toda linha sem checagem de nulo.

> [!TIP] Comece pelo formato, não pelas configurações
> Nove em cada dez vezes, o que você quer é um template com um `values` diferente e um botão que o abre. Isso não precisa de edições no prefab. Confira os campos de novo depois de uma atualização do jogo. Assim que o terreno estiver certo, **[Biomas](#/nml/biomes)** decide o que cresce nele :PES2_Wise:.
