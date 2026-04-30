class Animal
    public procedure new(name)
        self.name = name
    endprocedure
    public function getName()
        return self.name
    endfunction
endclass

a = Animal("Dog")
print(a.getName())
