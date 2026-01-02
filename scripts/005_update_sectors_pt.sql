-- Update existing sectors to Portuguese names
UPDATE sectors SET name = 'Pensões' WHERE name = 'Pensions';
UPDATE sectors SET name = 'Licenciamento' WHERE name = 'Licensing';
UPDATE sectors SET name = 'Disputas Legais' WHERE name = 'Legal Disputes';
UPDATE sectors SET name = 'Assistência Médica' WHERE name = 'Medical Assistance';

-- Update descriptions to Portuguese
UPDATE sectors SET description = 'Gestão de fundos de pensão e benefícios' WHERE name = 'Pensões';
UPDATE sectors SET description = 'Processos de emissão e gestão de licenças' WHERE name = 'Licenciamento';
UPDATE sectors SET description = 'Resolução de casos legais e disputas' WHERE name = 'Disputas Legais';
UPDATE sectors SET description = 'Programas de saúde e assistência médica' WHERE name = 'Assistência Médica';
