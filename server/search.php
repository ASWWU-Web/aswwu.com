<?php

  class Search {
    private $results;

    public function __construct($q,$limits) {
      global $db, $user, $current_year;
      $this->results = [];

      $functions = ["profiles","archives"];
      if (count($limits) > 0) {
        foreach ($limits as $l)
          if (($l-1)%101 === 0)
            $this->archive_year = $l;
        if (isset($this->archive_year) && $this->archive_year == $current_year)
          $limits = ["profiles"];
        $functions = array_intersect($functions,$limits);
      }
      foreach ($functions as $f) {
        if ($q !== "" || $f == "profiles") {
          $this->$f($this->buildQueryString($q,$f));
        }
      }
    }

    public function fetch() {
      return $this->results;
    }

    private function buildQueryString($q,$f) {
      $pairs = explode(";",$q);
      $q = [];
      foreach ($pairs as $pair) {
        $pair = explode("=",$pair);
        $key = $pair[0];
        $value = (count($pair) == 2 ? $pair[1] : $pair[0]);
        if ($key == $value) {
          if ($f == "profiles" || $f == "archives") {
            $value = str_replace(".","%",$value);
            $value = str_replace(" ","%",$value);
            $p = "(username LIKE '%".$value."%' OR fullname LIKE '%".$value."%' COLLATE NOCASE)";
          }
        } else
          $p = $key." LIKE '%".$value."%' COLLATE NOCASE";
        $q[] = $p;
      }
      $q = implode(" AND ",$q);
      return $q;
    }

    private function profiles($q) {
      global $db, $current_year;
      $r = $db["people"]->select("profiles","id",$q);
      foreach ($r as $row) {
        $p = new Profile($row["id"],$current_year);
        $this->results[] = $p->fetch();
        unset($p);
      }
    }

    private function archives($q) {
      global $db, $current_year;
      if (isset($this->archive_year)) {
        $r = $db["archives"]->select("profiles".sprintf("%04d",$this->archive_year),"id",$q);
        foreach ($r as $row) {
          $p = new Profile($row["id"],$this->archive_year);
          $this->results[] = $p->fetch();
          unset($p);
        }
      } else {
        $y = $current_year-101;
        while ($y >= 607) {
          $r = $db["archives"]->select("profiles".sprintf("%04d",$y),"id",$q);
          foreach ($r as $row) {
            $p = new Profile($row["id"],$y);
            $this->results[] = $p->fetch();
            unset($p);
          }
          $y -= 101;
        }
      }
    }

  }

?>
