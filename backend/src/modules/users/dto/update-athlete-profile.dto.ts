import { IsDateString, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateAthleteProfileDto {
  // Datos físicos
  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  // Datos deportivos
  @IsOptional()
  @IsString()
  sailNumber?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  // Planificación
  @IsOptional()
  @IsString()
  seasonGoal?: string;

  @IsOptional()
  @IsString()
  currentMicrocycle?: string;

  @IsOptional()
  @IsString()
  weeklyObjectives?: string;

  @IsOptional()
  @IsString()
  todayObjective?: string;

  @IsOptional()
  @IsObject()
  kpis?: Record<string, unknown>;

  // Competición
  @IsOptional()
  @IsString()
  nextEvent?: string;

  // Equipo
  @IsOptional()
  @IsString()
  boatSetup?: string;
}
