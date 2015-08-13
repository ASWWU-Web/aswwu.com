<?php

  function isAssoc($arr) {
    return array_keys($arr) !== range(0, count($arr) - 1);
  }

  function intTime() {
    $time = getdate();
    return $time["year"]*10000+$time["mon"]*100+$time["mday"];
  }

  class DataBase {
    private $db;

    public function __construct($db) {
      $this->db = new SQLite3($db);
    }

    private function query($query) {
      $results = $this->db->query($query);
      if (!$results)
        return false;
      $rows = [];
      while ($result = $results->fetchArray(SQLITE3_ASSOC))
        $rows[] = $result;
      return $rows;
    }

    private function conditionString($conditions) {
      if (is_array($conditions)) {
        if (isAssoc($conditions)) {
          foreach ($conditions as $key => $value)
            $where[] = $key."='".$value."'";
              $conditions = $where;
        }
        $conditions = " where ".implode(" and ", $conditions);
      } else if ($conditions)
        $conditions = " where ".$conditions;

      return $conditions;
    }

    public function select($table,$columns,$conditions) {
      if (is_array($columns)) $columns = implode(",", $columns);
      $conditions = $this->conditionString($conditions);

      $query_string = "select ".$columns." from ".$table.$conditions;
      $results = $this->query($query_string);
      return $results;
    }

    public function insert($table,$data) {
      if (!isAssoc($data))
        return false;

      $query_string = "insert into ".$table." (".implode(",", array_keys($data)).') values ("'.implode('","', array_values($data)).'");';
      $this->db->exec($query_string);
      return true;
    }

    public function update($table,$data,$conditions) {
      if (!isAssoc($data))
        return false;

      $conditions = $this->conditionString($conditions);
      $query_string = $this->conditionString($data);
      $query_string = str_replace(" and ", ", ", $query_string);
      $query_string = str_replace(" where ", "", $query_string);
      $query_string = "update ".$table." set ".$query_string.$conditions;
      $this->db->exec($query_string);
      return true;
    }

    public function close() {
      $this->db->close();
      unset($this->db);
      unset($this);
    }
  }

  class loggedInUser {
    public function __construct($user) {
      global $db, $errors;

      if (!isset($user->wwuid)) {
        $errors[] = "invalid user";
        return false;
      }

      $dbuser = $db["people"]->select("users","*",["wwuid"=>$user->wwuid]);
      if (!$dbuser) {
        $errors[] = "user does not exist";
        return false;
      } else if (isset($user->token)) {
        $dbuser[0]["token"] = $user->token;
      }
      $user = $dbuser[0];

      foreach ($user as $key => $value)
        if (!in_array($key,["auth_salt","auth_time"]))
          $this->$key = $value;

      $photo = $db["people"]->select("profiles","wwuid,photo","user_id='".$this->id."'");
      if ($photo && isset($photo[0]))
        $this->photo = $photo[0]["photo"];
      else {
        $db["people"]->insert("profiles",[
          "id"=>uniqid(),
          "user_id"=>$this->id,
          "wwuid"=>$this->wwuid,
          "username"=>$this->username,
          "fullname"=>$this->fullname,
          "updated_at"=>intTime()]
        );
        $this->photo = "";
      }

      if (!isset($this->token)) {
        $this->token = $this->generate_token();
      }
    }

    private function generate_token() {
      global $errors, $db;
      if (!isset($this->username) || !isset($this->id)) {
        $errors[] = "invalid user";
        return false;
      } else {
        $time = time();
        $salt = md5(uniqid(mt_rand(), true));
        $db["people"]->update("users",["auth_salt"=>$salt,"auth_time"=>$time],["id"=>$this->id]);
        return md5($time.$salt);
      }
    }

    public function verify() {
      global $db;
      if (!isset($this->id))
        return false;
      $info = $db["people"]->select("users",["auth_salt","auth_time"],["id"=>$this->id])[0];
      if ($this->token == md5($info["auth_time"].$info["auth_salt"]) && $info["auth_time"] >= time()-60*10) {
        if (isset($_GET["verify"]))
          $this->token = $this->generate_token();
        return true;
      } else
        return false;
    }
  }

  class Profile {
    private $pn = 0;
    private $view_levels = [];
    private $user_id;
    private $data;
    private $dbname;
    private $tablename;

    public function __construct($id, $y) {
      global $user, $current_year;
      if (!isset($y) || $y == $current_year) {
        $this->dbname = "people";
        $this->tablename = "profiles";
      } else {
        $this->dbname = "archives";
        $this->tablename = "profiles".sprintf("%04d",$y);
        $this->year = "".sprintf("%04d",$y);
      }

      $this->view_levels[3] = ["id","user_id","updated_at"];
      $this->view_levels[2] = array_merge(["wwuid"],$this->view_levels[3]);
      $this->view_levels[1] = array_merge(["gender"],$this->view_levels[2]);
      $this->view_levels[0] = array_merge(["birthday","email","phone","website"],$this->view_levels[1]);

      $this->id = $id;
      $this->load();
    }

    private function load() {
      global $db, $user, $errors;
      $result = $db[$this->dbname]->select($this->tablename,"*","id='".$this->id."'");

      if ($result) {
        $result = $result[0];
        if (isset($user) && $user->verify()) {
          if (isset($user->roles) && in_array("admin", $user->roles))
            $this->pn = 3;
          else if ($user->id == $result["user_id"])
            $this->pn = 2;
          else
            $this->pn = 1;
        }

        if (isset($_POST["profile_data"])) {
          if ($temp = json_decode($_POST["profile_data"]))
            if ($profile_data = get_object_vars($temp))
              $this->update($profile_data);
          unset($_POST["profile_data"]);
        }

        foreach ($this->view_levels[$this->pn] as $column)
          unset($result[$column]);
        foreach ($result as $key => $value)
          $this->data[$key] = $value;
      } else {
        $errors[] = "profile not found";
      }
    }

    public function update($data) {
      global $db, $user, $errors;
      if ($this->pn >= 2 && isset($user) && $user->verify()) {
        $response = $db[$this->dbname]->update($this->tablename,$data,"user_id='".$user->id."'");
        if ($response) {
          return true;
        } else {
          $errors[] = "database error";
          return false;
        }
      } else {
        $errors[] = "invalid permissions";
        return false;
      }
    }

    public function fetch() {
      return $this->data;
    }

  }

?>
