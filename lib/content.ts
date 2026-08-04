// lib/content.ts
import { supabase } from "@/lib/supabaseClient";

// ---------- Types ----------

export type Profile = {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  status: string;
  summary: string;
  buildSheet: { label: string; value: string }[];
};

export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  period: string;
  points: string[];
  sort_order: number;
};

export type Project = {
  id: string;
  slug: string;
  code: string;
  name: string;
  tagline: string;
  stack: string[];
  points: string[];
  link: string | null;
  sort_order: number;
};

export type SkillGroup = {
  id: string;
  label: string;
  items: string[];
  sort_order: number;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url: string | null;
  sort_order: number;
};

export type EducationItem = {
  id: string;
  school: string;
  program: string;
  period: string;
  sort_order: number;
};

// ---------- Fetchers ----------

export async function getProfile(): Promise<Profile> {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("Failed to load profile:", error?.message);
    return {
      name: "",
      role: "",
      location: "",
      email: "",
      phone: "",
      linkedin: "",
      status: "",
      summary: "",
      buildSheet: [],
    };
  }

  return {
    name: data.name,
    role: data.role,
    location: data.location,
    email: data.email,
    phone: data.phone,
    linkedin: data.linkedin,
    status: data.status,
    summary: data.summary,
    buildSheet: data.build_sheet ?? [],
  };
}

export async function getExperience(): Promise<ExperienceItem[]> {
  const { data, error } = await supabase
    .from("experience")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load experience:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load projects:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  const { data, error } = await supabase
    .from("skill_groups")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load skill groups:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getCertifications(): Promise<Certification[]> {
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load certifications:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getEducation(): Promise<EducationItem[]> {
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load education:", error.message);
    return [];
  }
  return data ?? [];
}