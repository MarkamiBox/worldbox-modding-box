// GENERATED from the decompiled game code (EntireGameCode.txt). Do not hand-edit:
// regenerate it when the game updates, or the checker starts lying about what exists.

/** Every field on AssetManager, i.e. every asset library in the game. */
export const ASSET_LIBRARIES: ReadonlySet<string> = new Set([
  'game_language_library', 'options_library', 'tile_tile_effects', 'base_stats_library',
  'world_log_library', 'history_groups', 'decisions_library', 'neural_layers',
  'graph_time_library', 'history_data_library', 'history_meta_data_library', 'world_laws_library',
  'world_law_groups', 'meta_type_library', 'meta_text_report_library',
  'meta_customization_library', 'meta_representation_library', 'culture_banners_library',
  'kingdom_banners_library', 'clan_banners_library', 'religion_banners_library',
  'language_banners_library', 'subspecies_banners_library', 'family_banners_library',
  'time_scales', 'communication_library', 'communication_topic_library', 'city_build_orders',
  'architecture_library', 'book_types', 'nameplates_library', 'combat_action_library',
  'biome_library', 'phenotype_library', 'dynamic_sprites_library', 'debug_tool_library',
  'brush_library', 'chromosome_type_library', 'gene_library', 'loyalty_library',
  'opinion_library', 'happiness_library', 'hotkey_library', 'tooltips', 'war_types_library',
  'sim_globals_library', 'color_style_library', 'effects_library', 'kingdom_colors_library',
  'clan_colors_library', 'subspecies_colors_library', 'languages_colors_library',
  'families_colors_library', 'armies_colors_library', 'culture_colors_library',
  'religion_colors_library', 'months', 'era_library', 'clouds', 'map_sizes', 'music_box', 'tiles',
  'top_tiles', 'culture_traits', 'culture_trait_groups', 'language_traits',
  'language_trait_groups', 'clan_traits', 'clan_trait_groups', 'subspecies_traits',
  'subspecies_trait_groups', 'religion_traits', 'religion_trait_groups', 'trait_rains',
  'professions', 'quantum_sprites', 'world_behaviours', 'personalities', 'drops', 'status',
  'spells', 'citizen_job_library', 'tasks_actor', 'tasks_city', 'tasks_kingdom', 'traits',
  'trait_groups', 'plots_library', 'plot_category_library', 'kingdoms', 'kingdoms_traits_groups',
  'kingdoms_traits', 'actor_library', 'buildings', 'name_generator', 'name_sets', 'disasters',
  'job_actor', 'job_city', 'job_kingdom', 'powers', 'items', 'items_modifiers', 'item_groups',
  'unit_hand_tools', 'resources', 'terraform', 'projectiles', 'signals', 'achievement_groups',
  'map_gen_templates', 'map_gen_settings', 'statistics_library', 'linguistics_library',
  'words_library', 'sentences_library', 'story_library', 'onomastics_library',
  'onomastics_evolution_library', 'rarity_library', 'knowledge_library', 'window_library',
  'list_window_library', 'power_tab_library', 'architect_mood_library', 'achievements',
  'locale_groups_library', 'tester_jobs', 'tester_tasks',
]);

/** Every id in BaseStatsLibrary. An unknown key thrown at base_stats[] crashes. */
export const STAT_IDS: ReadonlySet<string> = new Set([
  'personality_aggression', 'personality_administration', 'personality_diplomatic',
  'personality_rationality', 'diplomacy', 'warfare', 'stewardship', 'intelligence', 'lifespan',
  'mutation', 'offspring', 'multiplier_offspring', 'army', 'cities', 'range', 'bonus_towers',
  'damage', 'speed', 'health', 'armor', 'stamina', 'mana', 'accuracy', 'targets', 'projectiles',
  'experience', 'happiness', 'critical_chance', 'critical_damage_multiplier', 'size',
  'area_of_effect', 'attack_speed', 'throwing_range', 'construction_speed', 'loyalty_traits',
  'birth_rate', 'maturation', 'age_adult', 'age_breeding', 'max_nutrition', 'metabolic_rate',
  'loyalty_mood', 'opinion', 'skill_combat', 'skill_spell', 'knockback', 'recoil', 'mass',
  'mass_2', 'multiplier_mass', 'limit_population', 'multiplier_health', 'multiplier_lifespan',
  'multiplier_stamina', 'multiplier_mana', 'multiplier_damage', 'multiplier_crit',
  'multiplier_diplomacy', 'multiplier_speed', 'multiplier_attack_speed', 'scale',
  'multiplier_supply_timer', 'limit_clan_members', 'status_chance', 'damage_range',
]);

/** Every tag the game itself reads off a BaseStats block. */
export const STAT_TAGS: ReadonlySet<string> = new Set([
  'always_idle_animation', 'building_immunity_fire', 'can_build_in_biome_corruption',
  'can_build_in_biome_desert', 'can_build_in_biome_infernal', 'can_build_in_biome_permafrost',
  'can_build_in_biome_swamp', 'can_build_in_biome_wasteland', 'can_read_any_book', 'civ', 'crab',
  'damaged_by_water', 'demon', 'diet_algae', 'diet_blood', 'diet_crops', 'diet_fish',
  'diet_flowers', 'diet_fruits', 'diet_grass', 'diet_meat', 'diet_meat_insect', 'diet_minerals',
  'diet_nectar', 'diet_same_species', 'diet_tiles', 'diet_vegetation', 'diet_wood', 'dwarf',
  'elf', 'everyone', 'evil', 'fast_swimming', 'frozen_ai', 'garlic', 'generate_light', 'good',
  'has_advanced_communication', 'has_advanced_memory', 'has_emotions', 'has_sapience', 'human',
  'ignore_fights', 'immovable', 'immunity_cold', 'immunity_fire', 'love_peace', 'mad', 'magic',
  'moody', 'nature_creature', 'needs_food', 'needs_mate', 'neutral', 'neutral_animals', 'orc',
  'oviparity', 'reproduction_asexual', 'reproduction_sexual', 'sliceable', 'small', 'snow',
  'steal_items', 'stop_idle_animation', 'strong_mind', 'unconscious', 'undead', 'viviparity',
  'walk_adaptation_sand', 'walk_adaptation_snow', 'walk_adaptation_swamp', 'water_creature',
]);

/** Group ids per trait system. A group_id outside these draws the trait nowhere. */
export const TRAIT_GROUPS: Record<string, ReadonlySet<string>> = {
  actor: new Set(['cognitive', 'mind', 'spirit', 'physique', 'health', 'body', 'appearance', 'protection', 'skills', 'merits', 'acquired', 'fun', 'fate', 'miscellaneous', 'special']),
  culture: new Set(['harmony', 'architecture', 'town_plan', 'kingdom', 'buildings', 'succession', 'knowledge', 'warfare', 'weapons', 'craft', 'happiness', 'worldview', 'miscellaneous', 'fate', 'special']),
  religion: new Set(['harmony', 'creation', 'destruction', 'restoration', 'necromancy', 'protection', 'the_void', 'transformation', 'fate', 'special']),
  subspecies: new Set(['harmony', 'advanced_brain', 'mind', 'body', 'diet', 'rebirth', 'growth', 'bioproducts', 'chaos', 'talents', 'sleep_cycles', 'hibernation', 'reproduction_strategy', 'reproductive_methods', 'gestation', 'eggs', 'mutations', 'adaptations', 'fate', 'phenotypes', 'special']),
  clan: new Set(['spirit', 'mind', 'body', 'chaos', 'harmony', 'fate', 'special']),
  language: new Set(['knowledge', 'spirit', 'harmony', 'chaos', 'miscellaneous', 'fate', 'special']),
  kingdom: new Set(['tribute', 'local_tax', 'miscellaneous', 'fate']),
};

/** Vanilla equipment categories. */
export const ITEM_GROUPS: ReadonlySet<string> = new Set([
  'helmet', 'armor', 'boots', 'ring', 'amulet', 'sword', 'axe', 'hammer', 'spear', 'bow', 'staff',
  'firearm',
]);

