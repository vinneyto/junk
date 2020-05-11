pub struct Define {
  pub name: String,
  pub value: Option<String>,
}

impl Define {
  pub fn new(name: &str, value: Option<&str>) -> Self {
    Define {
      name: name.to_string(),
      value: value.map(|s| s.to_string()),
    }
  }

  pub fn def(name: &str) -> Self {
    Define::new(name, None)
  }

  pub fn int(name: &str, v: i32) -> Self {
    Define::new(name, Some(&format!("{}", v)))
  }

  pub fn float(name: &str, v: f32) -> Self {
    Define::new(name, Some(&format!("{}", v)))
  }

  pub fn as_string(&self) -> String {
    let mut result = String::from(&format!("#define {}", &self.name));
    if let Some(value) = &self.value {
      result.push_str(" ");
      result.push_str(value);
    }
    result
  }
}
