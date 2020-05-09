use anyhow::{anyhow, Result};
use log::error;
use std::collections::HashMap;
use web_sys::{WebGlProgram, WebGlRenderingContext, WebGlShader, WebGlUniformLocation};

use super::context::ComponentType;
use super::define::Define;
use crate::math::{Matrix4, Vector3, Vector4};

pub struct Shader {
  gl: WebGlRenderingContext,
  program: WebGlProgram,
  attribute_locations: HashMap<String, u32>,
  uniform_locations: HashMap<String, WebGlUniformLocation>,
}

impl Shader {
  pub fn new(
    gl: &WebGlRenderingContext,
    vertex_src: &str,
    fragment_src: &str,
    defines: &[Define],
  ) -> Result<Shader> {
    let vert = add_header(vertex_src, defines, false);
    let frag = add_header(fragment_src, defines, true);

    let vert_shader = compile_shader(gl, WebGlRenderingContext::VERTEX_SHADER, &vert)?;
    let frag_shader = compile_shader(gl, WebGlRenderingContext::FRAGMENT_SHADER, &frag)?;

    let program = link_program(&gl, &vert_shader, &frag_shader)?;

    let attribute_locations = collect_attributes(gl, &program);
    let uniform_locations = collect_uniforms(gl, &program);

    Ok(Shader {
      gl: gl.clone(),
      program,
      attribute_locations,
      uniform_locations,
    })
  }

  pub fn bind(&self) {
    self.gl.use_program(Some(&self.program));
  }

  pub fn bind_attribute(&self, name: &str, attribute: &AttributeOptions) -> Option<()> {
    let location = self.attribute_locations.get(name)?;

    self.gl.vertex_attrib_pointer_with_i32(
      *location,
      attribute.item_size,
      attribute.component_type as u32,
      attribute.normalized,
      attribute.stride,
      attribute.offset,
    );

    Some(())
  }

  pub fn set_bool(&self, name: &str, v: bool) -> Option<()> {
    let location = self.uniform_locations.get(name)?;

    self.gl.uniform1i(Some(location), if v { 1 } else { 0 });

    Some(())
  }

  pub fn set_float(&self, name: &str, v: f32) -> Option<()> {
    let location = self.uniform_locations.get(name)?;

    self.gl.uniform1f(Some(location), v);

    Some(())
  }

  pub fn set_integer(&self, name: &str, v: i32) -> Option<()> {
    let location = self.uniform_locations.get(name)?;

    self.gl.uniform1i(Some(location), v);

    Some(())
  }

  pub fn set_vector4(&self, name: &str, v: &Vector4) -> Option<()> {
    let location = self.uniform_locations.get(name)?;

    self.gl.uniform4f(Some(location), v.x, v.y, v.z, v.w);

    Some(())
  }

  pub fn set_vector3(&self, name: &str, v: &Vector3) -> Option<()> {
    let location = self.uniform_locations.get(name)?;

    self.gl.uniform3f(Some(location), v.x, v.y, v.z);

    Some(())
  }

  pub fn set_matrix4(&self, name: &str, m: &Matrix4) -> Option<()> {
    let location = self.uniform_locations.get(name)?;

    self
      .gl
      .uniform_matrix4fv_with_f32_array(Some(location), false, &m.data);

    Some(())
  }
}

#[derive(Debug, Default)]
pub struct AttributeOptions {
  pub component_type: ComponentType,
  pub item_size: i32,
  pub normalized: bool,
  pub stride: i32,
  pub offset: i32,
}

impl AttributeOptions {
  pub fn new(component_type: ComponentType, item_size: i32) -> AttributeOptions {
    AttributeOptions {
      component_type,
      item_size,
      normalized: false,
      stride: 0,
      offset: 0,
    }
  }
}

pub fn compile_shader(
  gl: &WebGlRenderingContext,
  shader_type: u32,
  source: &str,
) -> Result<WebGlShader> {
  let shader = gl
    .create_shader(shader_type)
    .ok_or_else(|| anyhow!("Unable to create shader object"))?;
  gl.shader_source(&shader, source);
  gl.compile_shader(&shader);

  if gl
    .get_shader_parameter(&shader, WebGlRenderingContext::COMPILE_STATUS)
    .as_bool()
    .unwrap_or(false)
  {
    Ok(shader)
  } else {
    let message = gl
      .get_shader_info_log(&shader)
      .unwrap_or_else(|| String::from("Unknown error creating shader"));

    error!(
      "{}",
      &format!("\n{}\n\n{}\n", message, add_row_numbers(source))
    );

    Err(anyhow!("shader compile error"))
  }
}

pub fn link_program(
  gl: &WebGlRenderingContext,
  vert_shader: &WebGlShader,
  frag_shader: &WebGlShader,
) -> Result<WebGlProgram> {
  let program = gl
    .create_program()
    .ok_or_else(|| anyhow!("Unable to create shader object"))?;

  gl.attach_shader(&program, vert_shader);
  gl.attach_shader(&program, frag_shader);
  gl.link_program(&program);

  if gl
    .get_program_parameter(&program, WebGlRenderingContext::LINK_STATUS)
    .as_bool()
    .unwrap_or(false)
  {
    Ok(program)
  } else {
    Err(anyhow!(gl.get_program_info_log(&program).unwrap_or_else(
      || String::from("Unknown error creating program object")
    )))
  }
}

pub fn collect_attributes(
  gl: &WebGlRenderingContext,
  program: &WebGlProgram,
) -> HashMap<String, u32> {
  let num_attributes = gl
    .get_program_parameter(program, WebGlRenderingContext::ACTIVE_ATTRIBUTES)
    .as_f64()
    .unwrap_or(0.0) as u32;

  let mut locations: HashMap<String, u32> = HashMap::new();

  for i in 0..num_attributes {
    match gl.get_active_attrib(program, i) {
      Some(info) => {
        let loc = gl.get_attrib_location(program, &info.name());
        locations.insert(info.name(), loc as u32);
      }
      None => {}
    }
  }

  locations
}

pub fn collect_uniforms(
  gl: &WebGlRenderingContext,
  program: &WebGlProgram,
) -> HashMap<String, WebGlUniformLocation> {
  let num_attributes = gl
    .get_program_parameter(program, WebGlRenderingContext::ACTIVE_UNIFORMS)
    .as_f64()
    .unwrap_or(0.0) as u32;

  let mut locations: HashMap<String, WebGlUniformLocation> = HashMap::new();

  for i in 0..num_attributes {
    if let Some(info) = gl.get_active_uniform(program, i) {
      if let Some(loc) = gl.get_uniform_location(program, &info.name()) {
        locations.insert(info.name(), loc);
      }
    }
  }

  locations
}

pub fn add_row_numbers(src: &str) -> String {
  let v: Vec<&str> = src.split('\n').collect();
  let mut result: String = String::from("");
  for (i, row) in v.iter().enumerate() {
    result.push_str(&format!("{}  {}\n", i + 1, row));
  }
  result
}

pub fn add_header(src: &str, defines: &[Define], with_precision: bool) -> String {
  let mut result = String::from("");
  if with_precision {
    result.push_str("precision highp float;\n\n");
  }
  if !defines.is_empty() {
    for define in defines {
      result.push_str(&format!("{}\n", &define.as_string()));
    }
    result.push_str("\n");
  }
  result.push_str(src);
  result
}
